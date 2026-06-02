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
    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, trim: true },
      },
    ],
    conversation: [
      {
        sender: {
          type: String,
          enum: ['student', 'landlord'],
          required: true,
        },
        message: {
          type: String,
          required: [true, 'Message is required'],
          trim: true,
          maxlength: [1000, 'Message cannot exceed 1000 characters'],
        },
        attachments: [
          {
            url: { type: String, required: true },
            filename: { type: String, trim: true },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    ratingComment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rating comment cannot exceed 1000 characters'],
    },
    ratedAt: {
      type: Date,
    },
    expectedDate: {
      type: Date,
    },
    acknowledgedAt: {
      type: Date,
    },
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
