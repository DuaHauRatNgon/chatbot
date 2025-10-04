const mongoose = require("mongoose");

const PodcastSchema = new mongoose.Schema({
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
  description: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("Podcast", PodcastSchema);
