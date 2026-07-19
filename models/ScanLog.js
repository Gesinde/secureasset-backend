const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if anonymous public scan
  gpsLat: { type: Number },
  gpsLng: { type: Number },
  isOffCampus: { type: Boolean, default: false },
  deviceInfo: { type: String }, // basic user-agent string
  action: {
    type: String,
    enum: ['verified', 'missing', 'misplaced', 'damaged', 'movement_flagged', 'fault_reported', 'view_only'],
    default: 'view_only'
  },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanLog', scanLogSchema);
