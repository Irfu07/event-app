import { useState } from "react";
import axios from "axios";

function ForgotPassword(){

const [email,setEmail] = useState("");

const submit = async(e)=>{

e.preventDefault();

const res = await axios.post(
"http://localhost:5000/forgot-password",
{email}
);

alert(res.data.resetLink);

};

return(

<div className="container">

<h2>Forgot Password</h2>

<form onSubmit={submit}>

<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<button>Send Reset Link</button>

</form>

</div>

);

}

export default ForgotPassword;