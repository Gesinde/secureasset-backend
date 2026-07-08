const SecurityIncident = require('../models/SecurityIncident');
const logAction = require('../middleware/auditLogger');

// Report an incident - security_officer, system_admin
exports.createIncident = async (req, res) => {
  try {
    const { assetId, description, location } = req.body;

    const incident = await SecurityIncident.create({
      asset: assetId || undefined,
      description,
      location,
      reportedBy: req.user.id
    });

    await logAction({
      action: 'SECURITY_INCIDENT_REPORTED',
      performedBy: req.user.id,
      targetType: 'SecurityIncident',
      targetId: incident._id,
      details: `Reported incident: ${description}`
    });

    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View all incidents - security_officer, system_admin, auditor
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await SecurityIncident.find()
      .populate('asset', 'name serialNumber department')
      .populate('reportedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status - security_officer, system_admin
exports.updateIncident = async (req, res) => {
  try {
    const incident = await SecurityIncident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    const updateData = { ...req.body };
    if (req.body.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updated = await SecurityIncident.findByIdAndUpdate(req.params.id, updateData, { new: true });

    await logAction({
      action: 'SECURITY_INCIDENT_UPDATED',
      performedBy: req.user.id,
      targetType: 'SecurityIncident',
      targetId: updated._id,
      details: `Updated incident status to ${updated.status}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
