import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function ResetPassword(){

const { token } = useParams();

const [password,setPassword] = useState("");

const submit = async(e)=>{

e.preventDefault();

await axios.post(
`http://localhost:5000/reset-password/${token}`,
{password}
);

alert("Password updated");

};

return(

<div className="container">

<h2>Reset Password</h2>

<form onSubmit={submit}>

<input
type="password"
placeholder="New password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button>Reset Password</button>

</form>

</div>

);

}

export default ResetPassword;