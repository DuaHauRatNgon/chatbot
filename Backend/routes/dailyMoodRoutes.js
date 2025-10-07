const express = require("express");
const router = express.Router();
const dailyMoodController = require("../controllers/dailyMoodController");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// POST /api/daily-moods - Save today's mood
router.post(
  "/",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  dailyMoodController.saveDailyMood
);

// GET /api/daily-moods/history - Get mood history
router.get(
  "/history",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  dailyMoodController.getMoodHistory
);

// GET /api/daily-moods/today - Get today's mood
router.get(
  "/today",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  dailyMoodController.getTodayMood
);

module.exports = router;
