//Defining accommodation requests from students to property owners
//Linking to User and Room models
//Stores move-in date, move-out date, and status (pending, approved, rejected), and funding type (NSFAS, private, self-funded)

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  moveInDate: {
    type: Date,
    required: [true, 'Please provide move-in date'],
  },
  leaseDuration: {
    type: String,
    enum: ['monthly', 'semester', 'yearly'],
    required: true,
  },
  fundingType: {
    type: String,
    enum: ['NSFAS', 'private', 'self-funded'],
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);