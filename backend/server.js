require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const Event = require("./models/Event");
const User = require("./models/user");

const app = express();

const JWT_SECRET = "secret123";

/* ========================== MIDDLEWARE ========================== */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ========================== DATABASE ========================== */

mongoose
  .connect("mongodb://127.0.0.1:27017/eventsDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ========================== MULTER STORAGE ========================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ==================================================================
   CREATE DEFAULT ADMIN (Runs once)
================================================================== */

async function createAdmin() {
  const admin = await User.findOne({ email: "irfu1605@gmail.com" });

  if (!admin) {
    await User.create({
      name: "Admin",
      email: "irfu1605@gmail.com",
      password: "Irfu1605",
      role: "admin",
    });
    console.log("Default Admin Created ✔");
  } else {
    console.log("Admin already exists ✔");
  }
}

createAdmin();

/* ==================================================================
   AUTH MIDDLEWARE (JWT)
================================================================== */

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }

  // Support both "Bearer <token>" and raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, name }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

/* ==================================================================
   LOGIN / REGISTER
================================================================== */

app.post("/auth", async (req, res) => {
  console.log("AUTH REQUEST:", req.body);

  const { name, email, password, role, type } = req.body;

  let user = await User.findOne({ email });

  /* ===== REGISTER ===== */
  if (type === "register") {
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();
    return res.json({ message: "Registered successfully" });
  }

  /* ===== LOGIN ===== */
  if (type === "login") {
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.password !== password)
      return res.status(400).json({ message: "Invalid password" });

    // ✅ Generate JWT with id, role, and name
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user._id,
      name: user.name,
    });
  }
});

/* ==================================================================
   GET ALL EVENTS
================================================================== */

app.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==================================================================
   GET SINGLE EVENT
================================================================== */

app.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==================================================================
   CREATE EVENT (ONLY ADMIN OR CREATOR)
================================================================== */

app.post("/events", auth, upload.array("images", 5), async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "creator") {
      return res.status(403).json({ message: "You cannot create events" });
    }

    const imageNames = req.files.map((file) => file.filename);

    const event = new Event({
  title: req.body.title,
  description: req.body.description,
  category: req.body.category,
  date: req.body.date,
  time: req.body.time,
  location: req.body.location,
  hostedBy: req.body.hostedBy,   // ✅ ADD THIS
  lat: req.body.lat,             // ✅ ADD THIS
  lng: req.body.lng,             // ✅ ADD THIS
  images: imageNames,
  creatorId: req.user.id,
  creatorRole: req.user.role,
  creatorName: req.user.name,
  interestedUsers: [],
});

    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==================================================================
   CREATOR EVENTS
================================================================== */

app.get("/creator/:id", async (req, res) => {
  try {
    const events = await Event.find({ creatorId: req.params.id });
    res.json(events);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==================================================================
   DELETE EVENT (ONLY ADMIN OR CREATOR WHO CREATED EVENT)
================================================================== */

app.delete("/events/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      req.user.role !== "admin" &&
      event.creatorId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "You cannot delete this event" });
    }

    event.images.forEach((img) => {
      const filePath = `uploads/${img}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==================================================================
   INTERESTED BUTTON
================================================================== */

app.put("/events/interested/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.interestedUsers) event.interestedUsers = [];

    if (event.interestedUsers.includes(userId)) {
      event.interestedUsers.pull(userId);
    } else {
      event.interestedUsers.push(userId);
    }

    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==================================================================
   SERVER START
================================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});