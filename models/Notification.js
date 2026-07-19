const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // specific user, or...
  recipientRole: { type: String }, // ...broadcast to a whole role, e.g. 'security_officer'
  type: {
    type: String,
    enum: [
      'transfer_request', 'transfer_approved', 'transfer_rejected',
      'borrowing_request', 'borrowing_approved', 'borrowing_overdue',
      'maintenance_assigned', 'maintenance_updated',
      'security_incident', 'off_campus_scan', 'anonymous_scan'
    ],
    required: true
  },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // asset/transfer/borrowing/etc id for click-through
  relatedType: { type: String }, // 'Asset' | 'Transfer' | 'Borrowing' | etc
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
