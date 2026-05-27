const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      default: 'direct',
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    properties: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ createdAt: -1, event: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
