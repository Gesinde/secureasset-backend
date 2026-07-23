const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  openSession,
  getMyOpenSession,
  getSessions,
  closeSession
} = require('../controllers/auditSessionController');

router.use(protect);
router.post('/', checkRole(['system_admin', 'auditor']), openSession);
router.get('/mine', checkRole(['system_admin', 'auditor']), getMyOpenSession);
router.get('/', checkRole(['system_admin', 'auditor']), getSessions);
router.put('/:id/close', checkRole(['system_admin', 'auditor']), closeSession);

module.exports = router;
