const router = require("express").Router();
const Event = require("../models/Event");

router.get("/", async(req,res)=>{

const events = await Event.find();
res.json(events);

});

router.get("/:id", async(req,res)=>{

const event = await Event.findById(req.params.id);
res.json(event);

});

router.post("/", async(req,res)=>{

const event = new Event(req.body);
await event.save();

res.json(event);

});

router.delete("/:id", async(req,res)=>{

await Event.findByIdAndDelete(req.params.id);
res.json({message:"Deleted"});

});

router.put("/interested/:id", async(req,res)=>{

const {userId} = req.body;

let event = await Event.findById(req.params.id);

if(event.interestedUsers.includes(userId)){
event.interestedUsers =
event.interestedUsers.filter(id=>id!==userId);
}
else{
event.interestedUsers.push(userId);
}

await event.save();

res.json(event);

});

module.exports = router;