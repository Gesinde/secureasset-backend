const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { createTransfer, getTransfers, respondToTransfer } = require('../controllers/transferController');

router.use(protect);
router.post('/', checkRole(['system_admin', 'department_head', 'department_staff']), createTransfer);
router.get('/', getTransfers);
router.put('/:id/respond', respondToTransfer);

module.exports = router;
