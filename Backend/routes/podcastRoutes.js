const express = require("express");
const router = express.Router();
const podcastController = require("../controllers/podcastController");

// GET /api/podcasts
router.get("/", podcastController.getAllPodcasts);

module.exports = router;
