const Asset = require('../models/Asset');
const ScanLog = require('../models/ScanLog');
const Notification = require('../models/Notification');
const boundary = require('../config/campusBoundary');
const AuditSession = require('../models/AuditSession');

// Checks if a GPS point falls outside the campus boundary rectangle
const isOutsideCampus = (lat, lng) => {
  if (lat == null || lng == null) return false; // no GPS provided, can't determine — treat as not flagged
  return (
    lat > boundary.NORTH ||
    lat < boundary.SOUTH ||
    lng > boundary.EAST ||
    lng < boundary.WEST
  );
};

// PUBLIC - no auth required. Returns only minimal, non-sensitive asset info.
exports.getPublicAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).select(
      'name category department status'
    );
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(404).json({ message: 'Asset not found' });
  }
};

// Logs a scan event - works for both logged-in users (req.user set by optionalAuth)
// and anonymous public scans (req.user undefined)
exports.logScan = async (req, res) => {
  try {
    const { assetId, gpsLat, gpsLng, action, notes } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const offCampus = isOutsideCampus(gpsLat, gpsLng);

    const scanLog = await ScanLog.create({
      asset: assetId,
      scannedBy: req.user ? req.user.id : undefined,
      gpsLat,
      gpsLng,
      isOffCampus: offCampus,
      deviceInfo: req.headers['user-agent'],
      action: action || 'view_only',
      notes
    });

    // Notify security/admin if this scan looks concerning
    if (offCampus || !req.user) {
      await Notification.create({
        recipientRole: offCampus ? 'security_officer' : 'system_admin',
        type: offCampus ? 'off_campus_scan' : 'anonymous_scan',
        message: offCampus
          ? `Asset "${asset.name}" was scanned off-campus`
          : `Asset "${asset.name}" was scanned by an unauthenticated user`,
        relatedId: asset._id,
        relatedType: 'Asset'
      });
    }

    res.status(201).json({ scanLog, offCampus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Role-specific action after a scan (auditor/security/staff)
exports.recordScanAction = async (req, res) => {
  try {
    const { assetId, action, notes } = req.body;
    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const allowedActionsByRole = {
      auditor: ['verified', 'missing', 'misplaced', 'damaged'],
      security_officer: ['movement_flagged'],
      department_staff: ['fault_reported'],
      department_head: ['fault_reported'],
      system_admin: ['verified', 'missing', 'misplaced', 'damaged', 'movement_flagged', 'fault_reported'],
    };

    const allowed = allowedActionsByRole[req.user.role] || [];
    if (!allowed.includes(action)) {
      return res.status(403).json({ message: 'Forbidden: action not permitted for your role' });
    }

    const scanLog = await ScanLog.create({
      asset: assetId,
      scannedBy: req.user.id,
      action,
      notes
    });

    // If this user has an open audit session, bump the matching counter
    const counterFieldByAction = {
      verified: 'verifiedCount',
      missing: 'missingCount',
      misplaced: 'misplacedCount',
      damaged: 'damagedCount',
    };
    const counterField = counterFieldByAction[action];
    if (counterField) {
      await AuditSession.findOneAndUpdate(
        { openedBy: req.user.id, status: 'open' },
        { $inc: { [counterField]: 1 } }
      );
    }

    res.status(201).json(scanLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent scan logs for an asset (for asset detail page history)
exports.getScanLogsForAsset = async (req, res) => {
  try {
    const logs = await ScanLog.find({ asset: req.params.assetId })
      .populate('scannedBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
