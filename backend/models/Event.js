const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  date: Date,
  time: String,
  location: String,
  hostedBy: String,
  lat: String,
  lng: String,
  images: [String],
  creatorId: String,
  creatorRole: String,
  creatorName: String,
  interestedUsers: [String]
});

module.exports = mongoose.model("Event", eventSchema);