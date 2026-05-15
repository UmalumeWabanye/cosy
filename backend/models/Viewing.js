const mongoose = require('mongoose');

const viewingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

viewingSchema.index({ student: 1, requestedDate: -1 });
viewingSchema.index({ property: 1, requestedDate: -1 });

module.exports = mongoose.model('Viewing', viewingSchema);
