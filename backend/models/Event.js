const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  date: String,
  time: String,
  location: String,
  interested: {
    type: Number,
    default: 0
  }, // ← missing comma was here

  images: [String],
  interestedUsers: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("Event", EventSchema);