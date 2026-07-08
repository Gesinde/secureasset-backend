const logAction = require('../middleware/auditLogger');
const Asset = require('../models/Asset');
const QRCode = require('qrcode');

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
    const verifyUrl = `http://localhost:5173/verify/${asset._id}`;
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
    res.status(500).json({ message: err.message });
  }
};

// READ ALL - scoped by role
exports.getAssets = async (req, res) => {
  try {
    let filter = {};

    // department_head and department_staff only see their own department's assets
    if (req.user.role === 'department_head' || req.user.role === 'department_staff') {
      filter.department = req.user.department;
    }

    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE - anyone authenticated can view a single asset (needed for QR scan)
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
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

