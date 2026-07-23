const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getScanMapPoints } = require('../controllers/mapController');

router.use(protect);
router.get('/scan-points', checkRole(['system_admin', 'security_officer', 'auditor']), getScanMapPoints);

module.exports = router;
