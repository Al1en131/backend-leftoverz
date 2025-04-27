const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware'); // Import authMiddleware
const UserController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authMiddleware, UserController.getProfile);

module.exports = router;
