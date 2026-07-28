const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { createTransfer, getTransfers, respondToTransfer } = require('../controllers/transferController');

router.use(protect);
router.post('/', checkPermission('transfer.create'), createTransfer);
router.get('/', getTransfers);
router.put('/:id/respond', respondToTransfer);

module.exports = router;
