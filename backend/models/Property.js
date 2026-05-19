const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    universityNearby: {
      type: String,
      required: [true, 'Nearby university is required'],
      trim: true,
    },
    nsfasAccredited: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Sharing', 'Ensuite', 'Bachelor'],
      required: [true, 'Room type is required'],
    },
    totalRooms: {
      type: Number,
      min: 0,
    },
    availableRooms: {
      type: Number,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    amenities: [String],
    rules: [String],
    utilities: [String],
    roomAllocations: [
      {
        roomNumber: { type: String, trim: true, required: true },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
        notes: { type: String, trim: true, default: '' },
        allocatedAt: { type: Date, default: Date.now },
      },
    ],
    distanceFromCampus: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['not_applicable', 'paid', 'due', 'overdue'],
      default: 'not_applicable',
    },
    contractStatus: {
      type: String,
      enum: ['not_applicable', 'draft', 'sent', 'signed', 'expired'],
      default: 'not_applicable',
    },
    communicationChannel: {
      type: String,
      trim: true,
      default: 'WhatsApp',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

propertySchema.index({ city: 1, universityNearby: 1, nsfasAccredited: 1 });

module.exports = mongoose.model('Property', propertySchema);
