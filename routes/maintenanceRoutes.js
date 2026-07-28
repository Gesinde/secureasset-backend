const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const {
  createRequest,
  getRequests,
  updateRequest
} = require('../controllers/maintenanceController');

router.use(protect);

router.post('/', checkPermission('maintenance.create'), createRequest);

router.get('/', getRequests);

router.put('/:id', checkPermission('maintenance.update'), updateRequest);

module.exports = router;