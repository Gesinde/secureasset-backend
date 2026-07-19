const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  assetTag: { type: String, unique: true, sparse: true }, // human-friendly tag e.g. CU-CS-0042
  department: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['in_use', 'under_maintenance', 'retired', 'available'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'condemned'],
    default: 'good'
  },
  purchaseDate: { type: Date },
  purchaseValue: { type: Number },
  vendor: { type: String },
  warrantyExpiry: { type: Date },
  description: { type: String },
  assignedTo: { type: String },
  qrCodeId: { type: String, unique: true, sparse: true },
  qrCodeImage: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', assetSchema);
