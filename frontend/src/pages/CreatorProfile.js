import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function CreatorProfile(){

const { id } = useParams();

const [events,setEvents] = useState([]);

useEffect(()=>{

axios.get(`http://localhost:5000/creator/${id}`)
.then(res=>{
setEvents(res.data);
})
.catch(err=>{
console.log(err);
});

},[id]);

return(

<div className="container">

<h2>Creator Events</h2>

{events.length===0 && <p>No events found</p>}

{events.map(event=>(
<div key={event._id} className="card">

<h3>{event.title}</h3>

<p><b>Category:</b> {event.category}</p>

<p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>

<p><b>Location:</b> {event.location}</p>

</div>
))}

</div>

);

}

export default CreatorProfile;