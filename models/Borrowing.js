const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String },
  expectedReturnDate: { type: Date, required: true },
  actualReturnDate: { type: Date },
  status: {
    type: String,
    enum: ['pending_hod_approval', 'pending_store_approval', 'approved', 'returned', 'rejected'],
    default: 'pending_hod_approval'
  },
  hodApprovedAt: { type: Date },
  storeApprovedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Borrowing', borrowingSchema);
