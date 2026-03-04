const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: {
    type: String,
    default: "pending"
  }
});

module.exports = mongoose.model("Application", ApplicationSchema);