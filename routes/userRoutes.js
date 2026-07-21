const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

router.use(protect);
router.get('/', getUsers);

module.exports = router;
