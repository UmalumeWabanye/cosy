//Defining room structure
//Links to properties like room name, description, creator, members, and timestamps for creation and updates
//Stores price, capacity, and availability status for each room

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide room title'],
    trim: true,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'shared', 'studio'],
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide room capacity'],
  },
  leaseOptions: {
    type: [String],
    default: ['monthly', 'semester', 'yearly'],
  },
  availability: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema);