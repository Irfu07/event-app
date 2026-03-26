const router = require("express").Router();
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

/* ===================== GET ALL ===================== */
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

/* ===================== GET BY ID ===================== */
router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

/* ===================== CREATE EVENT ===================== */
router.post("/", authMiddleware, upload.array("images"), async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => f.filename) : [];

    const event = new Event({
      ...req.body,
      images,
      creatorId: req.user.id,
      creatorRole: req.user.role,
      creatorName: req.user.name,
    });

    await event.save();
    res.json(event);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== DELETE EVENT ===================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) return res.status(404).json({ message: "Not found" });

  // Allow only creator or admin
  if (event.creatorId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ===================== TOGGLE INTERESTED ===================== */
router.put("/interested/:id", authMiddleware, async (req, res) => {
  const event = await Event.findById(req.params.id);
  const userId = req.user.id;

  if (!event) return res.status(404).json({ message: "Event not found" });

  if (event.interestedUsers.includes(userId)) {
    event.interestedUsers = event.interestedUsers.filter(id => id !== userId);
  } else {
    event.interestedUsers.push(userId);
  }

  await event.save();
  res.json(event);
});

module.exports = router;