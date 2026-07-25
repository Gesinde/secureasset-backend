const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  setDepartmentActiveStatus
} = require('../controllers/departmentController');

router.use(protect);
router.get('/', getDepartments);
router.post('/', checkRole(['system_admin']), createDepartment);
router.put('/:id', checkRole(['system_admin']), updateDepartment);
router.put('/:id/status', checkRole(['system_admin']), setDepartmentActiveStatus);

module.exports = router;
