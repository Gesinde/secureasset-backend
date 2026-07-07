const MaintenanceRequest = require('../models/MaintenanceRequest');
const logAction = require('../middleware/auditLogger');

// Raise a request - system_admin, department_head, department_staff, maintenance_officer
exports.createRequest = async (req, res) => {
  try {
    const { assetId, description } = req.body;

    const request = await MaintenanceRequest.create({
      asset: assetId,
      description,
      raisedBy: req.user.id
    });

    await logAction({
      action: 'MAINTENANCE_RAISED',
      performedBy: req.user.id,
      targetType: 'MaintenanceRequest',
      targetId: request._id,
      details: `Raised maintenance request for asset ${assetId}`
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all requests - visible to everyone, but maintenance_technician only sees ones assigned to them
exports.getRequests = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'maintenance_technician') {
      filter.assignedTechnician = req.user.id;
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate('asset', 'name serialNumber department')
      .populate('raisedBy', 'name role')
      .populate('assignedTechnician', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status / assign technician - system_admin, maintenance_officer, maintenance_technician
exports.updateRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // maintenance_technician can only update requests assigned to them
    if (
      req.user.role === 'maintenance_technician' &&
      request.assignedTechnician?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Forbidden: not your assigned request' });
    }

    const updateData = { ...req.body };
    if (req.body.status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });

    await logAction({
      action: 'MAINTENANCE_UPDATED',
      performedBy: req.user.id,
      targetType: 'MaintenanceRequest',
      targetId: updated._id,
      details: `Updated maintenance request status to ${updated.status}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
