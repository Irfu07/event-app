const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Create ONLY one admin (hardcoded)
router.post("/create-admin", async (req, res) => {
  const admin = await User.findOne({ email: "irfu1605@gmail.com" });
  if (admin) return res.json({ message: "Admin already exists" });

  const newAdmin = new User({
    name: "Admin",
    email: "irfu1605@gmail.com",
    password: "Irfu1605",
    role: "admin"
  });

  await newAdmin.save();
  res.json(newAdmin);
});

// LOGIN
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || user.password !== req.body.password)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});

module.exports = router;