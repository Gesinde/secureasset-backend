const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logAction = require('../middleware/auditLogger');

// Defines who may act at each stage, and what happens on approval
const STAGE_CONFIG = {
  pending_sender_hod: {
    canAct: (user, transfer) =>
      user.role === 'system_admin' ||
      (user.role === 'department_head' && user.department === transfer.fromDepartment),
    nextStatus: 'pending_recipient',
    timestampField: 'senderHodApprovedAt',
  },
  pending_recipient: {
    canAct: (user, transfer) =>
      user.role === 'system_admin' || user.id === transfer.recipient.toString(),
    nextStatus: 'pending_recipient_hod',
    timestampField: 'recipientAcceptedAt',
  },
  pending_recipient_hod: {
    canAct: (user, transfer) =>
      user.role === 'system_admin' ||
      (user.role === 'department_head' && user.department === transfer.toDepartment),
    nextStatus: 'completed',
    timestampField: 'recipientHodApprovedAt',
  },
};

// CREATE - system_admin, department_head, department_staff
exports.createTransfer = async (req, res) => {
  try {
    const { assetId, toDepartment, recipientId, reason } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    if (req.user.role !== 'system_admin' && req.user.department !== asset.department) {
      return res.status(403).json({ message: 'Forbidden: asset is not in your department' });
    }

    if (asset.department === toDepartment) {
      return res.status(400).json({ message: 'Asset is already in that department' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'Recipient user not found' });
    if (recipient.department !== toDepartment) {
      return res.status(400).json({ message: 'Recipient does not belong to the destination department' });
    }

    const transfer = await Transfer.create({
      asset: assetId,
      fromDepartment: asset.department,
      toDepartment,
      requestedBy: req.user.id,
      recipient: recipientId,
      reason,
      status: 'pending_sender_hod'
    });

    await logAction({
      action: 'TRANSFER_REQUESTED',
      performedBy: req.user.id,
      targetType: 'Transfer',
      targetId: transfer._id,
      details: `Requested transfer of asset ${asset.name} from ${asset.department} to ${toDepartment}`
    });

    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL - scoped by role
exports.getTransfers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'department_head' || req.user.role === 'department_staff') {
      filter = {
        $or: [
          { fromDepartment: req.user.department },
          { toDepartment: req.user.department },
          { requestedBy: req.user.id },
          { recipient: req.user.id }
        ]
      };
    } else if (req.user.role !== 'system_admin' && req.user.role !== 'auditor') {
      // roles with no stake in transfers get an empty list, not a 403
      return res.json([]);
    }

    const transfers = await Transfer.find(filter)
      .populate('asset', 'name serialNumber')
      .populate('requestedBy', 'name role department')
      .populate('recipient', 'name role department')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESPOND (approve/accept, or reject) - one endpoint covers all three stages
exports.respondToTransfer = async (req, res) => {
  try {
    const { decision, reason } = req.body; // decision: 'approve' | 'reject'
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });

    if (transfer.status === 'completed' || transfer.status === 'rejected') {
      return res.status(400).json({ message: 'This transfer has already been finalized' });
    }

    const stage = STAGE_CONFIG[transfer.status];
    if (!stage.canAct(req.user, transfer)) {
      return res.status(403).json({ message: 'Forbidden: not your turn to act on this transfer' });
    }

    if (decision === 'reject') {
      transfer.status = 'rejected';
      transfer.rejectedAt = new Date();
      transfer.rejectionReason = reason || 'No reason given';
      await transfer.save();

      await logAction({
        action: 'TRANSFER_REJECTED',
        performedBy: req.user.id,
        targetType: 'Transfer',
        targetId: transfer._id,
        details: `Rejected transfer: ${transfer.rejectionReason}`
      });

      await Notification.create({
        recipient: transfer.requestedBy,
        type: 'transfer_rejected',
        message: `Your asset transfer request was rejected: ${transfer.rejectionReason}`,
        relatedId: transfer._id,
        relatedType: 'Transfer'
      });

      return res.json(transfer);
    }

    // decision === 'approve'
    transfer[stage.timestampField] = new Date();
    transfer.status = stage.nextStatus;
    await transfer.save();

    if (stage.nextStatus === 'completed') {
      await Asset.findByIdAndUpdate(transfer.asset, { department: transfer.toDepartment });
    }

    await logAction({
      action: 'TRANSFER_UPDATED',
      performedBy: req.user.id,
      targetType: 'Transfer',
      targetId: transfer._id,
      details: `Transfer moved to status: ${transfer.status}`
    });

    res.json(transfer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
