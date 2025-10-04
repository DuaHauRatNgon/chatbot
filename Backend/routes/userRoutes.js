const express = require("express")
const router = express.Router();
const userController = require('../controllers/userController');

// Route đăng ký
router.post('/register', userController.register);

// Route đăng nhập
router.post('/login', userController.login);

module.exports = router;