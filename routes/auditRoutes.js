const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditController');

router.use(protect);
router.get('/', checkPermission('audit.view'), getAuditLogs);

module.exports = router;
