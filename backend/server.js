require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const Event = require("./models/Event");

const app = express();

/* Middleware */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* MongoDB Connection */

mongoose.connect("mongodb://127.0.0.1:27017/eventsDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

/* Multer Storage */

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,"uploads/");
},

filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname));
}

});

const upload = multer({storage});
/* LOGIN ROUTE */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // High-level logic (Replace with real database check later)
  if (email && password) {
    res.json({ 
      id: "123", 
      email: email, 
      token: "fake-jwt-token" 
    });
  } else {
    res.status(400).json({ message: "Email and password required" });
  }
});

/* CREATE EVENT */

app.post("/events", upload.array("images"), async(req,res)=>{

try{

const images = req.files ? req.files.map(file=>file.filename) : [];

const event = new Event({

title:req.body.title,
description:req.body.description,
date:req.body.date,
time:req.body.time,
location:req.body.location,
category:req.body.category,
images

});

await event.save();

res.json(event);

}catch(err){

res.status(500).json(err);

}

});

/* GET EVENTS */

app.get("/events", async(req,res)=>{

try{

const events = await Event.find().sort({date:1});
res.json(events);

}catch(err){

res.status(500).json(err);

}

});

/* GET SINGLE EVENT */

app.get("/events/:id", async(req,res)=>{

try{

const event = await Event.findById(req.params.id);
res.json(event);

}catch(err){

res.status(500).json(err);

}

});

/* DELETE EVENT */

app.delete("/events/:id", async(req,res)=>{

try{

await Event.findByIdAndDelete(req.params.id);
res.json({message:"Deleted"});

}catch(err){

res.status(500).json(err);

}

});

/* INTERESTED BUTTON */

app.put("/events/interested/:id", async(req,res)=>{

try{

const {userId} = req.body;

const event = await Event.findById(req.params.id);

if(event.interestedUsers.includes(userId)){

event.interestedUsers.pull(userId);

}else{

event.interestedUsers.push(userId);

}

await event.save();

res.json(event);

}catch(err){

res.status(500).json(err);

}

});

/* Server */

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log(`Server running on port ${PORT}`);

});