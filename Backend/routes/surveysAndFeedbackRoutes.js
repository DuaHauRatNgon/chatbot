const express = require("express");
const router = express.Router();
const surveysAndFeedbackController = require("../controllers/surveysAndFeedbackController");

// GET /api/surveysAndFeedbacks
router.get("/", surveysAndFeedbackController.getAllSurveysAndFeedbacks);

module.exports = router;
