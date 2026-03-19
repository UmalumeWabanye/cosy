// Saved Listings Model
// Allows students to shortlist properties they're interested in

const mongoose = require('mongoose');

const savedListingSchema = new mongoose.Schema({
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
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can't save the same property twice
savedListingSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('SavedListing', savedListingSchema);