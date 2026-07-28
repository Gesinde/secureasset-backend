const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getPermissions } = require('../controllers/permissionController');

router.use(protect);
// Intentionally uses the OLD checkRole here, not checkPermission — viewing the
// permission matrix itself is system_admin-only and doesn't need to be
// configurable via the very system it's displaying.
router.get('/', checkRole(['system_admin']), getPermissions);

module.exports = router;
