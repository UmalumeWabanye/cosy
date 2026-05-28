const mongoose = require('mongoose');

const adminActionAuditSchema = new mongoose.Schema(
  {
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    action: {
      type: String,
      enum: ['queue-run', 'queue-requeue-failed', 'queue-requeue-selected'],
      required: true,
      index: true,
    },
    correlationId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

adminActionAuditSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActionAudit', adminActionAuditSchema);
