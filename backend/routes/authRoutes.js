const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.post("/", async(req,res)=>{

const {name,email,password,role,type} = req.body;

let user = await User.findOne({email});

if(type==="register"){

if(user){
return res.status(400).json({message:"User already exists"});
}

user = new User({name,email,password,role});
await user.save();

return res.json({message:"Registered"});
}

if(type==="login"){

if(!user || user.password!==password){
return res.status(400).json({message:"Invalid credentials"});
}

const token = jwt.sign(
{id:user._id,role:user.role},
"secret123",
{expiresIn:"1d"}
);

res.json({token,role:user.role});

}

});

module.exports = router;