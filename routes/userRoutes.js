const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const { getUsers, createUser, updateUser, setUserActiveStatus } = require('../controllers/userController');

router.use(protect);
router.get('/', getUsers);
router.post('/', checkPermission('user.create'), createUser);
router.put('/:id', checkPermission('user.update'), updateUser);
router.put('/:id/status', checkPermission('user.status'), setUserActiveStatus);

module.exports = router;
