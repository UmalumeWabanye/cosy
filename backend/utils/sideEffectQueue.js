const Notification = require('../models/Notification');
const SideEffectJob = require('../models/SideEffectJob');
const sendEventEmail = require('./sendEventEmail');

let isProcessing = false;

const STALE_LOCK_MS = 10 * 60 * 1000;
const COMPLETED_RETENTION_DAYS = Number(process.env.SIDE_EFFECT_COMPLETED_RETENTION_DAYS || 7);
const FAILURE_ALERT_THRESHOLD = Number(process.env.SIDE_EFFECT_FAILED_ALERT_THRESHOLD || 10);
const OLDEST_PENDING_ALERT_SECONDS = Number(process.env.SIDE_EFFECT_OLDEST_PENDING_ALERT_SECONDS || 15 * 60);

const appendHistory = (history = [], event = {}) => {
  const next = [...history, { at: new Date(), ...event }];
  if (next.length <= 25) return next;
  return next.slice(next.length - 25);
};

const enqueueNotificationJob = async ({ payload, correlationId = '' }) => {
  if (!payload) return null;
  return SideEffectJob.create({
    type: 'notification',
    payload,
    correlationId,
    history: [{ action: 'created', status: 'pending', detail: 'notification enqueued' }],
  });
};

const enqueueEmailJob = async ({ payload, correlationId = '' }) => {
  if (!payload) return null;
  return SideEffectJob.create({
    type: 'email',
    payload,
    correlationId,
    history: [{ action: 'created', status: 'pending', detail: 'email enqueued' }],
  });
};

const executeJob = async (job) => {
  if (job.type === 'notification') {
    await Notification.create(job.payload);
    return;
  }

  if (job.type === 'email') {
    await sendEventEmail(job.payload);
    return;
  }

  throw new Error(`Unsupported side effect job type: ${job.type}`);
};

const lockNextJob = async () => {
  const now = new Date();

  return SideEffectJob.findOneAndUpdate(
    {
      status: { $in: ['pending', 'failed'] },
      $expr: { $lt: ['$attempts', '$maxAttempts'] },
      runAfter: { $lte: now },
    },
    {
      $set: {
        status: 'processing',
        lockedAt: now,
      },
      $inc: { attempts: 1 },
    },
    {
      sort: { createdAt: 1 },
      new: true,
    }
  ).lean();
};

const recoverStaleProcessingJobs = async ({ staleAfterMs = STALE_LOCK_MS } = {}) => {
  const cutoff = new Date(Date.now() - Math.max(60 * 1000, Number(staleAfterMs) || STALE_LOCK_MS));
  const staleJobs = await SideEffectJob.find({
    status: 'processing',
    lockedAt: { $lte: cutoff },
  }).select('_id history').lean();

  if (!staleJobs.length) return 0;

  const now = new Date();
  for (const job of staleJobs) {
    await SideEffectJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status: 'pending',
          runAfter: now,
          lockedAt: null,
          history: appendHistory(job.history, {
            action: 'recovered_stale',
            status: 'pending',
            detail: 'stale processing lock recovered',
          }),
        },
      }
    );
  }

  return staleJobs.length;
};

const cleanupCompletedJobs = async ({ retentionDays = COMPLETED_RETENTION_DAYS, limit = 500 } = {}) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - Math.max(1, retentionDays) * 24 * 60 * 60 * 1000);

  const staleCompleted = await SideEffectJob.find({
    status: 'completed',
    completedAt: { $lte: cutoff },
  })
    .sort({ completedAt: 1 })
    .limit(Math.max(1, Math.min(1000, limit)))
    .select('_id')
    .lean();

  if (!staleCompleted.length) return 0;

  const ids = staleCompleted.map((item) => item._id);
  const deleted = await SideEffectJob.deleteMany({ _id: { $in: ids } });
  return Number(deleted.deletedCount || 0);
};

const processSideEffectQueue = async ({ batchSize = 20, workerId = 'main' } = {}) => {
  if (isProcessing) {
    return { skipped: true, reason: 'already_processing' };
  }

  isProcessing = true;
  let processed = 0;
  let failed = 0;
  let recoveredStale = 0;
  let cleanedUp = 0;

  try {
    recoveredStale = await recoverStaleProcessingJobs();

    for (let i = 0; i < batchSize; i += 1) {
      const job = await lockNextJob();
      if (!job) break;

      await SideEffectJob.updateOne(
        { _id: job._id },
        {
          $set: {
            history: appendHistory(job.history, {
              action: 'locked',
              status: 'processing',
              workerId,
              detail: 'job locked for processing',
            }),
          },
        }
      );

      try {
        await executeJob(job);
        await SideEffectJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              expiresAt: new Date(Date.now() + Math.max(1, COMPLETED_RETENTION_DAYS) * 24 * 60 * 60 * 1000),
              lastError: '',
              lockedAt: null,
              history: appendHistory(job.history, {
                action: 'completed',
                status: 'completed',
                workerId,
                detail: 'job processed successfully',
              }),
            },
          }
        );
        processed += 1;
      } catch (error) {
        const attempts = Number(job.attempts || 1);
        const backoffMs = Math.min(5 * 60 * 1000, attempts * 30 * 1000);
        const nextRun = new Date(Date.now() + backoffMs);
        const finalFailure = attempts >= Number(job.maxAttempts || 3);

        await SideEffectJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: finalFailure ? 'failed' : 'pending',
              runAfter: nextRun,
              lastError: error?.message || String(error),
              lockedAt: null,
              history: appendHistory(job.history, {
                action: 'failed',
                status: finalFailure ? 'failed' : 'pending',
                workerId,
                detail: error?.message || String(error),
              }),
            },
          }
        );
        failed += 1;
      }
    }

    cleanedUp = await cleanupCompletedJobs();

    return { skipped: false, recoveredStale, processed, failed, cleanedUp };
  } finally {
    isProcessing = false;
  }
};

const getQueueHealth = async ({ failedSampleLimit = 10 } = {}) => {
  const now = new Date();

  const [
    pending,
    processing,
    completed,
    failed,
    oldestPending,
    stalled,
    recentFailures,
  ] = await Promise.all([
    SideEffectJob.countDocuments({ status: 'pending' }),
    SideEffectJob.countDocuments({ status: 'processing' }),
    SideEffectJob.countDocuments({ status: 'completed' }),
    SideEffectJob.countDocuments({ status: 'failed' }),
    SideEffectJob.findOne({ status: 'pending' }).sort({ createdAt: 1 }).select('createdAt runAfter').lean(),
    SideEffectJob.countDocuments({ status: 'processing', lockedAt: { $lte: new Date(now.getTime() - STALE_LOCK_MS) } }),
    SideEffectJob.find({ status: 'failed' })
      .sort({ updatedAt: -1 })
      .limit(failedSampleLimit)
      .select('type attempts maxAttempts lastError correlationId updatedAt')
      .lean(),
  ]);

  const oldestPendingSeconds = oldestPending?.createdAt
    ? Math.max(0, Math.round((now.getTime() - new Date(oldestPending.createdAt).getTime()) / 1000))
    : 0;

  const alerts = [];
  if (failed >= FAILURE_ALERT_THRESHOLD) {
    alerts.push({
      code: 'FAILED_THRESHOLD',
      severity: 'warning',
      message: `Failed jobs (${failed}) crossed threshold (${FAILURE_ALERT_THRESHOLD}).`,
    });
  }
  if (oldestPendingSeconds >= OLDEST_PENDING_ALERT_SECONDS) {
    alerts.push({
      code: 'PENDING_AGE_THRESHOLD',
      severity: 'warning',
      message: `Oldest pending job age is ${oldestPendingSeconds}s (threshold ${OLDEST_PENDING_ALERT_SECONDS}s).`,
    });
  }
  if (stalled > 0) {
    alerts.push({
      code: 'STALLED_JOBS',
      severity: 'critical',
      message: `${stalled} jobs are stalled in processing state.`,
    });
  }

  return {
    queue: {
      pending,
      processing,
      completed,
      failed,
      stalled,
      oldestPendingSeconds,
    },
    thresholds: {
      failureAlertThreshold: FAILURE_ALERT_THRESHOLD,
      oldestPendingAlertSeconds: OLDEST_PENDING_ALERT_SECONDS,
      staleLockMs: STALE_LOCK_MS,
      completedRetentionDays: Math.max(1, COMPLETED_RETENTION_DAYS),
    },
    alerts,
    recentFailures,
  };
};

const requeueFailedJobs = async ({ id, limit = 100 } = {}) => {
  const query = id
    ? { _id: id, status: 'failed' }
    : { status: 'failed' };

  const jobs = await SideEffectJob.find(query)
    .sort({ updatedAt: -1 })
    .limit(Math.max(1, Math.min(500, Number(limit) || 100)))
    .select('_id history')
    .lean();

  if (!jobs.length) {
    return { matched: 0, requeued: 0 };
  }

  const ids = jobs.map((job) => job._id);
  const result = await SideEffectJob.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: 'pending',
        runAfter: new Date(),
        lastError: '',
        lockedAt: null,
      },
      $unset: { completedAt: '', expiresAt: '' },
    }
  );

  for (const job of jobs) {
    await SideEffectJob.updateOne(
      { _id: job._id },
      {
        $set: {
          history: appendHistory(job.history, {
            action: 'requeued',
            status: 'pending',
            detail: 'failed job manually requeued',
          }),
        },
      }
    );
  }

  return {
    matched: ids.length,
    requeued: Number(result.modifiedCount || 0),
  };
};

const requeueFailedJobsByIds = async ({ ids = [] } = {}) => {
  const normalizedIds = Array.isArray(ids)
    ? ids.map((value) => String(value || '').trim()).filter(Boolean)
    : [];

  if (!normalizedIds.length) {
    return { matched: 0, requeued: 0 };
  }

  const jobs = await SideEffectJob.find({
    _id: { $in: normalizedIds },
    status: 'failed',
  })
    .select('_id history')
    .lean();

  if (!jobs.length) {
    return { matched: 0, requeued: 0 };
  }

  const idsToUpdate = jobs.map((job) => job._id);
  const result = await SideEffectJob.updateMany(
    { _id: { $in: idsToUpdate } },
    {
      $set: {
        status: 'pending',
        runAfter: new Date(),
        lastError: '',
        lockedAt: null,
      },
      $unset: { completedAt: '', expiresAt: '' },
    }
  );

  for (const job of jobs) {
    await SideEffectJob.updateOne(
      { _id: job._id },
      {
        $set: {
          history: appendHistory(job.history, {
            action: 'requeued',
            status: 'pending',
            detail: 'failed job requeued from selected list',
          }),
        },
      }
    );
  }

  return {
    matched: idsToUpdate.length,
    requeued: Number(result.modifiedCount || 0),
  };
};

module.exports = {
  enqueueEmailJob,
  enqueueNotificationJob,
  getQueueHealth,
  processSideEffectQueue,
  recoverStaleProcessingJobs,
  requeueFailedJobs,
  requeueFailedJobsByIds,
};
