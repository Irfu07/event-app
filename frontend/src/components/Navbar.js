import { Link, useNavigate } from "react-router-dom";

function Navbar(){

const navigate = useNavigate();

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const logout = ()=>{

localStorage.clear();

navigate("/auth");

};

return(

<nav className="navbar">

<h2 className="logo">Nearby Events</h2>

{/* SHOW MENU ONLY AFTER LOGIN */}

{token && (

<div className="nav-links">

<Link to="/dashboard">Home</Link>

{(role==="creator" || role==="admin") && (

<Link to="/create">Create Event</Link>

)}

<button className="logout-btn" onClick={logout}>
Logout
</button>

</div>

)}

</nav>

);

}

export default Navbar;