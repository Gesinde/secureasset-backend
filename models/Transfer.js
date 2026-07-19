const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  fromDepartment: { type: String, required: true },
  toDepartment: { type: String, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: ['pending_sender_hod', 'pending_recipient', 'pending_recipient_hod', 'completed', 'rejected'],
    default: 'pending_sender_hod'
  },
  senderHodApprovedAt: { type: Date },
  recipientAcceptedAt: { type: Date },
  recipientHodApprovedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', transferSchema);
