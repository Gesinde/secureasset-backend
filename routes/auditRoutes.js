const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditController');

router.use(protect);
router.get('/', checkRole(['system_admin', 'auditor']), getAuditLogs);

module.exports = router;
