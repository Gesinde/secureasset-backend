const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset
} = require('../controllers/assetController');

// All asset routes require login
router.use(protect);

// Only system_admin can create
router.post('/', checkRole(['system_admin']), createAsset);

// Everyone (all 7 roles) can view the list, scoped by controller logic
router.get('/', getAssets);

// Everyone can view a single asset (needed for QR scan verification)
router.get('/:id', getAssetById);

// system_admin (any) or department_head (own dept, checked in controller)
router.put('/:id', checkRole(['system_admin', 'department_head']), updateAsset);

// Only system_admin can delete
router.delete('/:id', checkRole(['system_admin']), deleteAsset);

module.exports = router;
