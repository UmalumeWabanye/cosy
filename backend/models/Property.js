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
    transportation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      mode: {
        type: String,
        enum: ['none', 'private', 'campus_route', 'both'],
        default: 'none',
      },
      providerName: {
        type: String,
        trim: true,
        default: '',
      },
      contact: {
        type: String,
        trim: true,
        default: '',
      },
      notes: {
        type: String,
        trim: true,
        default: '',
      },
      schedules: [
        {
          routeName: { type: String, trim: true, default: '' },
          pickupFromResidence: { type: String, trim: true, default: '' },
          departureToCampus: { type: String, trim: true, default: '' },
          returnPickupFromCampus: { type: String, trim: true, default: '' },
          arrivalAtResidence: { type: String, trim: true, default: '' },
          days: [{ type: String, trim: true }],
        },
      ],
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
