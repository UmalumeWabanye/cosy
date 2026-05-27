const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    filters: {
      search: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      university: { type: String, trim: true, default: '' },
      minPrice: { type: Number, min: 0, default: null },
      maxPrice: { type: Number, min: 0, default: null },
      roomType: { type: String, trim: true, default: '' },
      nsfas: { type: Boolean, default: false },
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
    lastMatchedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

savedSearchSchema.index({ student: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
