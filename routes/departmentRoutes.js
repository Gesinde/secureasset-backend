const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  setDepartmentActiveStatus
} = require('../controllers/departmentController');

router.use(protect);
router.get('/', getDepartments);
router.post('/', checkPermission('department.create'), createDepartment);
router.put('/:id', checkPermission('department.update'), updateDepartment);
router.put('/:id/status', checkPermission('department.status'), setDepartmentActiveStatus);

module.exports = router;
