const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Who this notification is for (admin = null means all admins)
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      enum: ['new_request', 'request_updated', 'new_user', 'user_invited', 'property_added'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Link to the relevant resource in the admin panel
    link: { type: String, default: null },
    // Reference IDs so the notification can be looked up / clicked through
    refModel: { type: String, enum: ['Request', 'User', 'Property'], default: null },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
