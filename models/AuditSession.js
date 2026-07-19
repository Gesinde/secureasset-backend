const mongoose = require('mongoose');

const auditSessionSchema = new mongoose.Schema({
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String }, // optional scope; blank means all departments
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  verifiedCount: { type: Number, default: 0 },
  missingCount: { type: Number, default: 0 },
  misplacedCount: { type: Number, default: 0 },
  damagedCount: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
});

module.exports = mongoose.model('AuditSession', auditSessionSchema);
