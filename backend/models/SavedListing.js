const mongoose = require('mongoose');

const savedListingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

savedListingSchema.index({ student: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('SavedListing', savedListingSchema);
