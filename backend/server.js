require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
console.log("MONGO_URI:", process.env.MONGO_URI);

const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;
/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

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
  
  images: [String],
  interestedUsers: [String],
  // ⭐ FIXED INTEREST SYSTEM
  interestedUsers: {
    type: [String],
    default: []
  }
});

const Event = mongoose.model("Event", EventSchema);

/* ================= CREATE EVENT ================= */
app.post("/events", upload.array("images", 5), async (req, res) => {
  try {
    
    const imageNames =
    req.files?.map(file => file.filename) || [];
    
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

// Get all
app.get("/events", async (req, res) => {
  const events = await Event.find().sort({ _id: -1 });
  res.json(events);
});

// Get single
app.get("/events/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

/* ================= INTEREST TOGGLE ================= */
app.put("/events/interested/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    const event = await Event.findById(req.params.id);
    
    const alreadyInterested =
    event.interestedUsers.includes(userId);
    
    if (alreadyInterested) {
      event.interestedUsers =
      event.interestedUsers.filter(id => id !== userId);
    } else {
      event.interestedUsers.push(userId);
    }
    
    await event.save();
    
    res.json(event);
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
