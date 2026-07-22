const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getUsers, createUser, updateUser, setUserActiveStatus } = require('../controllers/userController');

router.use(protect);
router.get('/', getUsers);
router.post('/', checkRole(['system_admin']), createUser);
router.put('/:id', checkRole(['system_admin']), updateUser);
router.put('/:id/status', checkRole(['system_admin']), setUserActiveStatus);

module.exports = router;
