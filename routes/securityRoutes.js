const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const {
  createIncident,
  getIncidents,
  updateIncident
} = require('../controllers/securityController');

router.use(protect);

router.post('/', checkPermission('security.create'), createIncident);
router.get('/', checkPermission('security.view'), getIncidents);
router.put('/:id', checkPermission('security.update'), updateIncident);

module.exports = router;
