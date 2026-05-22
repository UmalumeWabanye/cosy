const mongoose = require('mongoose');

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Heating / Cooling',
  'Internet / WiFi',
  'Locks / Security',
  'Appliances',
  'Structural',
  'Pest Control',
  'Other',
];

const maintenanceSchema = new mongoose.Schema(
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
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    // Set by landlord when they acknowledge and schedule the fix
    expectedDate: {
      type: Date,
    },
    // Optional note from the landlord (e.g. "Plumber booked for Thursday")
    landlordNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

maintenanceSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Maintenance', maintenanceSchema);
