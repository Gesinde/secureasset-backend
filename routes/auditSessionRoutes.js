const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const {
  openSession,
  getMyOpenSession,
  getSessions,
  closeSession
} = require('../controllers/auditSessionController');

router.use(protect);
router.post('/', checkPermission('auditsession.create'), openSession);
router.get('/mine', checkPermission('auditsession.mine'), getMyOpenSession);
router.get('/', checkPermission('auditsession.view'), getSessions);
router.put('/:id/close', checkPermission('auditsession.close'), closeSession);

module.exports = router;
