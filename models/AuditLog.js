const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. "ASSET_CREATED", "ASSET_UPDATED", "ASSET_DELETED", "MAINTENANCE_RAISED"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String }, // e.g. "Asset", "MaintenanceRequest"
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
