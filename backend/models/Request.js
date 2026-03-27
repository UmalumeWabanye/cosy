const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    moveInDate: {
      type: Date,
      required: [true, 'Move-in date is required'],
    },
    leaseDuration: {
      type: Number,
      required: [true, 'Lease duration (months) is required'],
      min: 1,
    },
    fundingType: {
      type: String,
      enum: ['NSFAS', 'Private', 'Self-funded'],
      required: [true, 'Funding type is required'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
