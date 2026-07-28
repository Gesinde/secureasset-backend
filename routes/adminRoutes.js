const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { getStats } = require('../controllers/adminController');

router.use(protect);
router.get('/stats', checkPermission('admin.stats'), getStats);

module.exports = router;
