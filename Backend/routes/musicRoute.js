const express = require("express");
const router = express.Router();
const musicController = require("../controllers/musicController");
const musicProxyController = require("../controllers/musicProxyController");

// GET /api/musics - Lấy tất cả nhạc
router.get("/", musicController.getAllMusics);

// GET /api/musics/search?q=keyword - Tìm kiếm nhạc
router.get("/search", musicController.searchMusic);

// GET /api/musics/mood/:mood - Lấy nhạc theo tâm trạng
router.get("/mood/:mood", musicController.getMusicByMood);

// GET /api/musics/stream/:trackId?url=... - Proxy audio stream (bypass CORS)
router.get("/stream/:trackId", musicProxyController.streamTrack);
router.options("/stream/:trackId", musicProxyController.handleOptions);

module.exports = router;
