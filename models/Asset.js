const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['in_use', 'under_maintenance', 'retired', 'available'],
    default: 'available'
  },
  assignedTo: { type: String }, // optional: staff/technician name or ID
  qrCodeId: { type: String, unique: true }, // will link to QR generation later
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', assetSchema);
