const express = require("express");
const router = express.Router();
const musicController = require("../controllers/musicController");

// GET /api/musics
router.get("/", musicController.getAllMusics);

module.exports = router;
