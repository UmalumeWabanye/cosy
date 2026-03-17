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
    distanceFromCampus: {
      type: Number,
      min: 0,
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
