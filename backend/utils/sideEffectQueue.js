const Notification = require('../models/Notification');
const SideEffectJob = require('../models/SideEffectJob');
const sendEventEmail = require('./sendEventEmail');

let isProcessing = false;

const STALE_LOCK_MS = 10 * 60 * 1000;

const enqueueNotificationJob = async ({ payload, correlationId = '' }) => {
  if (!payload) return null;
  return SideEffectJob.create({
    type: 'notification',
    payload,
    correlationId,
  });
};

const enqueueEmailJob = async ({ payload, correlationId = '' }) => {
  if (!payload) return null;
  return SideEffectJob.create({
    type: 'email',
    payload,
    correlationId,
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

const lockNextJob = async (workerId) => {
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
  const result = await SideEffectJob.updateMany(
    {
      status: 'processing',
      lockedAt: { $lte: cutoff },
    },
    {
      $set: {
        status: 'pending',
        runAfter: new Date(),
        lockedAt: null,
      },
    }
  );

  return Number(result.modifiedCount || 0);
};

const processSideEffectQueue = async ({ batchSize = 20, workerId = 'main' } = {}) => {
  if (isProcessing) {
    return { skipped: true, reason: 'already_processing' };
  }

  isProcessing = true;
  let processed = 0;
  let failed = 0;
  let recoveredStale = 0;

  try {
    recoveredStale = await recoverStaleProcessingJobs();

    for (let i = 0; i < batchSize; i += 1) {
      const job = await lockNextJob(workerId);
      if (!job) break;

      try {
        await executeJob(job);
        await SideEffectJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              lastError: '',
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
            },
          }
        );
        failed += 1;
      }
    }

    return { skipped: false, recoveredStale, processed, failed };
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
    SideEffectJob.countDocuments({ status: 'processing', lockedAt: { $lte: new Date(now.getTime() - 10 * 60 * 1000) } }),
    SideEffectJob.find({ status: 'failed' })
      .sort({ updatedAt: -1 })
      .limit(failedSampleLimit)
      .select('type attempts maxAttempts lastError correlationId updatedAt')
      .lean(),
  ]);

  const oldestPendingSeconds = oldestPending?.createdAt
    ? Math.max(0, Math.round((now.getTime() - new Date(oldestPending.createdAt).getTime()) / 1000))
    : 0;

  return {
    queue: {
      pending,
      processing,
      completed,
      failed,
      stalled,
      oldestPendingSeconds,
    },
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
    .select('_id')
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
      $unset: { completedAt: '' },
    }
  );

  return {
    matched: ids.length,
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
};
