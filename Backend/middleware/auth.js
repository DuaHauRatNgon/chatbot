const jwt = require("jsonwebtoken");
const User = require("../model/user");
const message = require("../model/message");
require("dotenv").config();

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token payload
    if (!decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "Invalid token payload - missing userId",
      });
    }

    // Find user by userId from token
    const user = await User.findById(decoded.userId).select("-hashedPassword");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ===== VALIDATION: So sánh dữ liệu token vs database =====

    // 1. Check user status
    if (user.status && user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is inactive or suspended",
      });
    }

    // 2. So sánh email (quan trọng nhất)
    if (decoded.email && decoded.email !== user.email) {
      return res.status(401).json({
        success: false,
        message: "Email has been changed. Please login again",
      });
    }

    // 3. So sánh age (nếu có thay đổi đáng kể)
    if (decoded.age && user.age && Math.abs(decoded.age - user.age) > 1) {
      return res.status(401).json({
        success: false,
        message: "User profile has been updated. Please login again",
      });
    }

    // 4. So sánh gender
    if (decoded.gender && decoded.gender !== user.gender) {
      return res.status(401).json({
        success: false,
        message: "User profile has been updated. Please login again",
      });
    }
    // 8. Check role (nếu có trong token và DB)
    if (decoded.role && user.role && decoded.role !== user.role) {
      return res.status(401).json({
        success: false,
        message: "User role has been changed. Please login again",
      });
    }

    // 9. Validation bổ sung - check thời gian tạo token không quá cũ
    const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat;
    const maxTokenAge = 7 * 24 * 60 * 60; // 7 ngày

    if (tokenAge > maxTokenAge) {
      return res.status(401).json({
        success: false,
        message: "Token is too old. Please login again",
      });
    }

    // ===== END VALIDATION =====

    // Attach user info to request
    req.user = user;
    req.userId = user._id;
    req.userEmail = user.email;
    req.userRole = user.role; // Thêm role vào request

    next();
  } catch (error) {

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Invalid token format",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// ===== UNIVERSAL ROLE-BASED ACCESS CONTROL MIDDLEWARE =====

/**
 * Middleware tổng quát để kiểm tra quyền truy cập
 * @param {Object} options - Cấu hình quyền truy cập
 * @param {Array} options.roles - Danh sách roles được phép truy cập
 * @param {boolean} options.allowOwner - Cho phép owner truy cập (mặc định: false)
 * @param {string} options.ownerField - Field để check ownership (mặc định: 'userId')
 * @param {boolean} options.hierarchical - Sử dụng role hierarchy (mặc định: false)
 * @param {string} options.minimumRole - Role tối thiểu (khi hierarchical = true)
 * @param {string} options.customMessage - Thông báo lỗi tùy chỉnh
 */
const requirePermission = (options = {}) => {
  const {
    roles = [],
    allowOwner = false,
    ownerField = "userId",
    hierarchical = false,
    minimumRole = null,
    customMessage = null,
  } = options;

  return (req, res, next) => {
    // Kiểm tra authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "User role not found",
      });
    }

    // Kiểm tra role dựa trên hierarchy
    if (hierarchical && minimumRole) {
      if (hasRoleOrAbove(req.user, minimumRole)) {
        return next();
      }
    }

    // Kiểm tra role trong danh sách được phép
    if (roles.length > 0 && roles.includes(userRole)) {
      return next();
    }

    // Kiểm tra ownership nếu được phép
    if (allowOwner) {
      // Admin luôn có quyền truy cập
      if (userRole === "admin") {
        return next();
      }

      // Kiểm tra ownership
      const targetUserId =
        req.params[ownerField] || req.body[ownerField] || req.params.id;

      if (targetUserId && req.user._id.toString() === targetUserId) {
        return next();
      }
    }

    // Trả về lỗi nếu không có quyền
    const errorMessage =
      customMessage ||
      (roles.length > 0
        ? `Access denied. Required roles: ${roles.join(", ")}`
        : "Access denied");

    return res.status(403).json({
      success: false,
      message: errorMessage,
    });
  };
};

// Helper function để tạo token với role
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    age: user.age,
    gender: user.gender,
    role: user.role, // Thêm role vào token
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// Helper function để check multiple roles
const hasAnyRole = (user, roles) => {
  return roles.includes(user.role);
};

// Helper function để check role hierarchy
const hasRoleOrAbove = (user, minimumRole) => {
  const roleHierarchy = {
    customer: 1,
    admin: 2,
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const minimumLevel = roleHierarchy[minimumRole] || 0;

  return userLevel >= minimumLevel;
};

module.exports = {
  authenticateToken,
  requirePermission, // Hàm chính để truyền tham số
  generateToken,
  hasAnyRole,
  hasRoleOrAbove,
};
