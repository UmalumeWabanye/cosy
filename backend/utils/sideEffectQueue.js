const Notification = require('../models/Notification');
const SideEffectJob = require('../models/SideEffectJob');
const sendEventEmail = require('./sendEventEmail');

let isProcessing = false;

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

const processSideEffectQueue = async ({ batchSize = 20, workerId = 'main' } = {}) => {
  if (isProcessing) {
    return { skipped: true, reason: 'already_processing' };
  }

  isProcessing = true;
  let processed = 0;
  let failed = 0;

  try {
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

    return { skipped: false, processed, failed };
  } finally {
    isProcessing = false;
  }
};

module.exports = {
  enqueueEmailJob,
  enqueueNotificationJob,
  processSideEffectQueue,
};
