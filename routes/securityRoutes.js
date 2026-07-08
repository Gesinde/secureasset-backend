const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  createIncident,
  getIncidents,
  updateIncident
} = require('../controllers/securityController');

router.use(protect);

router.post('/', checkRole(['security_officer', 'system_admin']), createIncident);
router.get('/', checkRole(['security_officer', 'system_admin', 'auditor']), getIncidents);
router.put('/:id', checkRole(['security_officer', 'system_admin']), updateIncident);

module.exports = router;
