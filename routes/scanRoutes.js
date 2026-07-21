const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getPublicAsset,
  logScan,
  recordScanAction,
  getScanLogsForAsset
} = require('../controllers/scanController');

// Public, no auth
router.get('/public/asset/:id', getPublicAsset);

// Works for both logged-in and anonymous scanners
router.post('/scan-log', optionalAuth, logScan);

// Requires login - role-specific post-scan actions
router.post('/scan-action', protect, recordScanAction);
router.get('/scan-log/:assetId', protect, getScanLogsForAsset);

module.exports = router;

