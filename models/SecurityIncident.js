const mongoose = require('mongoose');

const securityIncidentSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }, // optional - incident may not always be tied to a specific asset
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved'],
    default: 'open'
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('SecurityIncident', securityIncidentSchema);
