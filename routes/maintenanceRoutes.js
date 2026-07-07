const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  createRequest,
  getRequests,
  updateRequest
} = require('../controllers/maintenanceController');

router.use(protect);

router.post(
  '/',
  checkRole(['system_admin', 'department_head', 'department_staff', 'maintenance_officer']),
  createRequest
);

router.get('/', getRequests);

router.put(
  '/:id',
  checkRole(['system_admin', 'maintenance_officer', 'maintenance_technician']),
  updateRequest
);

module.exports = router;
