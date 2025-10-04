const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const multer = require("multer");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// Cấu hình multer để lưu file PDF tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file PDF"), false);
    }
  },
});

// Routes
router.post(
  "/",
  authenticateToken,
  requirePermission({ roles: ["admin"] }),
  documentController.createDocument
);
router.post(
  "/advanced",
  authenticateToken,
  requirePermission({ roles: ["admin"] }),
  upload.single("pdfFile"),
  documentController.createDocumentsAdvanced
);

module.exports = router;
