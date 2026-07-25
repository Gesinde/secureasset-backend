const logAction = require('../middleware/auditLogger');
const Asset = require('../models/Asset');
const QRCode = require('qrcode');
const ScanLog = require('../models/ScanLog');

// CREATE - system_admin only
exports.createAsset = async (req, res) => {
  try {
    const { name, category, serialNumber, department, location, status } = req.body;

    const asset = await Asset.create({
      name,
      category,
      serialNumber,
      department,
      location,
      status,
      createdBy: req.user.id
    });

    // Generate QR code encoding a verify URL pointing to this asset
    const verifyUrl = `https://secureasset.vercel.app/verify/${asset._id}`;
    const qrCodeImage = await QRCode.toDataURL(verifyUrl);

    asset.qrCodeId = asset._id.toString();
    asset.qrCodeImage = qrCodeImage;
    await asset.save();

    await logAction({
      action: 'ASSET_CREATED',
      performedBy: req.user.id,
      targetType: 'Asset',
      targetId: asset._id,
      details: `Created asset: ${asset.name}`
    });

    res.status(201).json(asset);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      const fieldLabel = { serialNumber: 'serial number', assetTag: 'asset tag', qrCodeId: 'QR code' }[field] || field;
      return res.status(400).json({ message: `An asset with this ${fieldLabel} already exists.` });
    }
    res.status(500).json({ message: err.message });
  }
};

// READ ALL - scoped by role
exports.getAssets = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'department_head' || req.user.role === 'department_staff') {
      filter.department = req.user.department;
    }

    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    const lastVerifiedList = await ScanLog.aggregate([
      { $match: { action: 'verified' } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$asset', lastVerifiedAt: { $first: '$timestamp' } } }
    ]);
    const lastVerifiedMap = {};
    lastVerifiedList.forEach((item) => {
      lastVerifiedMap[item._id.toString()] = item.lastVerifiedAt;
    });

    const assetsWithVerification = assets.map((a) => ({
      ...a.toObject(),
      lastVerifiedAt: lastVerifiedMap[a._id.toString()] || null
    }));

    res.json(assetsWithVerification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE - anyone authenticated can view a single asset (needed for QR scan)
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const lastVerified = await ScanLog.findOne({ asset: asset._id, action: 'verified' })
      .sort({ timestamp: -1 })
      .select('timestamp');

    res.json({
      ...asset.toObject(),
      lastVerifiedAt: lastVerified ? lastVerified.timestamp : null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE - system_admin (any) or department_head (own department only)
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    if (req.user.role === 'department_head' && asset.department !== req.user.department) {
      return res.status(403).json({ message: 'Forbidden: not your department' });
    }

    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await logAction({
      action: 'ASSET_UPDATED',
      performedBy: req.user.id,
      targetType: 'Asset',
      targetId: updated._id,
      details: `Updated asset: ${updated.name}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE - system_admin only (already enforced at route level, but double-checked here)
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    await Asset.findByIdAndDelete(req.params.id);

    await logAction({
      action: 'ASSET_DELETED',
      performedBy: req.user.id,
      targetType: 'Asset',
      targetId: asset._id,
      details: `Deleted asset: ${asset.name}`
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

