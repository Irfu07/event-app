const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);