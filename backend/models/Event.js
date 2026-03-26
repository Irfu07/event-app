const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  date: String,
  time: String,
  location: String,
  hostedBy: String,

  images: [String],

  creatorId: {
    type: String,
    required: true,
  },

  creatorRole: {
    type: String,
    enum: ["admin", "creator", "user"],
    default: "creator",
  },

  creatorName: {
    type: String,
  },

  interestedUsers: {
    type: [String],
    default: [],
  },

  lat: Number,
  lng: Number,
});

module.exports = mongoose.model("Event", eventSchema);