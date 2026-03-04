const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= DATABASE ================= */
mongoose.connect("mongodb://127.0.0.1:27017/eventsDB")
.then(()=>console.log("MongoDB Connected"));

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ================= MODEL ================= */
const EventSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  date: String,
  time: String,
  location: String,
  images: [String]   // ⭐ multiple images
});

const Event = mongoose.model("Event", EventSchema);

/* ================= CREATE EVENT ================= */
app.post("/events", upload.array("images", 5), async (req, res) => {
  try {

    const imageNames = req.files.map(file => file.filename);

    const event = new Event({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      images: imageNames
    });

    await event.save();
    res.json(event);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET EVENTS ================= */
app.get("/events/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});
// GET ALL EVENTS
app.get("/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});


app.listen(5000, () => console.log("Server running on port 5000"));
app.put("/events/interested/:id", async (req, res) => {
  try {
    const { userId } = req.body; // frontend sends user id

    const event = await Event.findById(req.params.id);

    const alreadyInterested =
      event.interestedUsers.includes(userId);

    if (alreadyInterested) {
      // remove interest
      event.interestedUsers =
        event.interestedUsers.filter(id => id !== userId);
    } else {
      // add interest
      event.interestedUsers.push(userId);
    }

    await event.save();

    res.json(event);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});