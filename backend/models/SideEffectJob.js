const mongoose = require('mongoose');

const sideEffectJobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['email', 'notification'],
      required: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    runAfter: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastError: {
      type: String,
      default: '',
    },
    correlationId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

sideEffectJobSchema.index({ status: 1, runAfter: 1, createdAt: 1 });

module.exports = mongoose.model('SideEffectJob', sideEffectJobSchema);
