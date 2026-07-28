const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { getScanMapPoints } = require('../controllers/mapController');

router.use(protect);
router.get('/scan-points', checkPermission('map.view'), getScanMapPoints);

module.exports = router;
