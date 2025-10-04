const mongoose = require("mongoose");

const surveysAndFeedback = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    require: true, // nên sửa thành `required`
  },
});

module.exports = mongoose.model("survey_and_feedback", surveysAndFeedback);
