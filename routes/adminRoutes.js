const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { getStats, bootstrapPermissions, bootstrapDepartments } = require('../controllers/adminController');
const { protect, checkRole, checkPermission } = require('../middleware/auth');

router.use(protect);
router.get('/stats', checkPermission('admin.stats'), getStats);

module.exports = router;

router.get('/stats', checkPermission('admin.stats'), getStats);
router.post('/bootstrap-permissions', checkRole(['system_admin']), bootstrapPermissions);
router.post('/bootstrap-departments', checkRole(['system_admin']), bootstrapDepartments);

