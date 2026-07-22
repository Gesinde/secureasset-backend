const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getStats } = require('../controllers/adminController');

router.use(protect);
router.get('/stats', checkRole(['system_admin']), getStats);

module.exports = router;
