const mongoose = require("mongoose");
const Event = require("./models/Event");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  console.log("Updating events...");

  const events = await Event.find();

  for (let ev of events) {
    ev.creatorRole = ev.creatorId === "ADMIN_USER_ID" ? "admin" : "creator";
    ev.creatorName = ev.hostedBy || "Organizer";
    await ev.save();
  }

  console.log("Done!");
  process.exit();
});