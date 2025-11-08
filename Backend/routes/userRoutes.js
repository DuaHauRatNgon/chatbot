const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// Route đăng ký
router.post("/register", userController.register);

// Route đăng nhập
router.post("/login", userController.login);

router.post(
  "/password",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  userController.changePassword
);

module.exports = router;
