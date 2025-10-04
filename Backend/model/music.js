const mongoose = require("mongoose");

const MusicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Music", MusicSchema);
