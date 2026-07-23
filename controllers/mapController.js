const ScanLog = require('../models/ScanLog');

// Returns scan events that have real GPS coordinates, for plotting on the security map.
// Security incidents are NOT included here - they don't have precise coordinates in this
// system, so they're shown as a separate list on the frontend instead of faked onto the map.
exports.getScanMapPoints = async (req, res) => {
  try {
    const points = await ScanLog.find({
      gpsLat: { $ne: null },
      gpsLng: { $ne: null }
    })
      .populate('asset', 'name department')
      .populate('scannedBy', 'name role')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
