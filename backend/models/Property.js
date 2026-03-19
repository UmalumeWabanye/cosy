const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Single', 'Shared/Communal', 'Double', 'Studio', 'Other'],
    required: [true, 'Please specify room type'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify quantity'],
    min: [1, 'Quantity must be at least 1'],
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Please specify available quantity'],
  },
  pricePerMonth: {
    type: Number,
    required: [true, 'Please specify price per month'],
  },
  description: String,
});

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a property name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    postalCode: {
      type: String,
    },
    university: {
      type: String,
      required: [true, 'Please provide nearby university'],
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  pricing: {
    minRent: {
      type: Number,
      required: [true, 'Please provide minimum rent'],
    },
    maxRent: {
      type: Number,
      required: [true, 'Please provide maximum rent'],
    },
    deposit: {
      type: Number,
      required: [true, 'Please provide deposit amount'],
    },
  },
  roomTypes: [roomTypeSchema],
  rooms: {
    total: {
      type: Number,
      required: [true, 'Please provide total rooms'],
    },
    available: {
      type: Number,
      required: [true, 'Please provide available rooms'],
    },
  },
  amenities: [
    {
      type: String,
      enum: [
        'WiFi',
        'Parking',
        'Gym',
        'Laundry',
        'Kitchen',
        'TV Lounge',
        'Garden',
        'Security',
        'DSTV',
        'Water Heater',
      ],
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  nsfasAccreditation: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Property', propertySchema);