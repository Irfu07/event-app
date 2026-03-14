require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Event = require("./models/Event");
const User = require("./models/user");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= DATABASE ================= */

mongoose
.connect("mongodb://127.0.0.1:27017/eventsDB")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* ================= MULTER STORAGE ================= */

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,"uploads/");
},

filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname));
}

});

const upload = multer({storage});

/* ================= AUTH MIDDLEWARE ================= */

function auth(req,res,next){

const token = req.headers.authorization;

if(!token){
return res.status(401).json({message:"No token provided"});
}

try{

const decoded = jwt.verify(token,process.env.JWT_SECRET);

req.user = decoded;

next();

}catch{

res.status(401).json({message:"Invalid token"});

}

}

/* ================= AUTH (REGISTER / LOGIN) ================= */

app.post("/auth", async(req,res)=>{

console.log("AUTH REQUEST:",req.body);

const {name,email,password,role,type} = req.body;

let user = await User.findOne({email});

/* ===== REGISTER ===== */

if(type==="register"){

if(user){
return res.status(400).json({message:"User already exists"});
}

/* HASH PASSWORD */

const hashedPassword = await bcrypt.hash(password,10);

user = new User({
name,
email,
password:hashedPassword,
role
});

await user.save();

return res.json({message:"Registered successfully"});
}

/* ===== LOGIN ===== */

if(type==="login"){

if(!user){
return res.status(400).json({message:"User not found"});
}

/* CHECK PASSWORD */

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.status(400).json({message:"Invalid password"});
}

/* JWT TOKEN */

const token = jwt.sign(
{
id:user._id,
role:user.role,
name:user.name
},
process.env.JWT_SECRET,
{expiresIn:"1d"}
);

return res.json({
token,
role:user.role,
userId:user._id
});

}

});
/* ================= FORGOT PASSWORD ================= */

app.post("/forgot-password", async (req, res) => {

try{

const { email } = req.body;

const user = await User.findOne({ email });

if(!user){
return res.status(404).json({ message: "User not found" });
}

/* CREATE RESET TOKEN */

const resetToken = jwt.sign(
{ id: user._id },
process.env.JWT_SECRET,
{ expiresIn: "15m" }
);

/* SAVE TOKEN IN USER */

user.resetToken = resetToken;
await user.save();

/* Normally you send email here */

res.json({
message:"Reset link generated",
resetLink:`http://localhost:3000/reset-password/${resetToken}`
});

}catch(err){
res.status(500).json(err);
}

});

/* ================= GET ALL EVENTS ================= */

app.get("/events", async(req,res)=>{

try{

const events = await Event.find().sort({date:1});

res.json(events);

}catch(err){
res.status(500).json(err);
}

});
/* ================= RESET PASSWORD ================= */

app.post("/reset-password/:token", async (req,res)=>{

try{

const { password } = req.body;

const decoded = jwt.verify(
req.params.token,
process.env.JWT_SECRET
);

const user = await User.findById(decoded.id);

if(!user){
return res.status(404).json({message:"User not found"});
}

/* HASH NEW PASSWORD */

const hashedPassword = await bcrypt.hash(password,10);

user.password = hashedPassword;
user.resetToken = null;

await user.save();

res.json({message:"Password updated successfully"});

}catch(err){

res.status(400).json({message:"Invalid or expired token"});

}

});

/* ================= GET SINGLE EVENT ================= */

app.get("/events/:id", async(req,res)=>{

try{

const event = await Event.findById(req.params.id);

if(!event){
return res.status(404).json({message:"Event not found"});
}

res.json(event);

}catch(err){
res.status(500).json(err);
}

});

/* ================= CREATE EVENT ================= */

app.post("/events", auth, upload.array("images",5), async(req,res)=>{

try{

const imageNames = req.files.map(file=>file.filename);

const event = new Event({

title:req.body.title,
description:req.body.description,
category:req.body.category,
date:req.body.date,
time:req.body.time,
location:req.body.location,

images:imageNames,

creatorId:req.user.id,
creatorRole:req.user.role,
creatorName:req.user.name,

interestedUsers:[]

});

await event.save();

res.json(event);

}catch(err){

res.status(500).json(err);

}

});

/* ================= CREATOR EVENTS ================= */

app.get("/creator/:id", async(req,res)=>{

try{

const events = await Event.find({
creatorId:req.params.id
});

res.json(events);

}catch(err){

res.status(500).json(err);

}

});

/* ================= DELETE EVENT ================= */

app.delete("/events/:id", auth, async(req,res)=>{

try{

const event = await Event.findById(req.params.id);

if(!event){
return res.status(404).json({message:"Event not found"});
}

/* PERMISSION CHECK */

if(
req.user.role!=="admin" &&
event.creatorId.toString()!==req.user.id
){
return res.status(403).json({
message:"You cannot delete this event"
});
}

/* DELETE IMAGES */

event.images.forEach(img=>{

const filePath=`uploads/${img}`;

if(fs.existsSync(filePath)){
fs.unlinkSync(filePath);
}

});

await Event.findByIdAndDelete(req.params.id);

res.json({message:"Event deleted"});

}catch(err){

res.status(500).json(err);

}

});

/* ================= INTERESTED BUTTON ================= */

app.put("/events/interested/:id",auth,async(req,res)=>{

try{

const userId=req.user.id;

const event=await Event.findById(req.params.id);

if(!event){
return res.status(404).json({message:"Event not found"});
}

if(!event.interestedUsers){
event.interestedUsers=[];
}

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

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`);
});