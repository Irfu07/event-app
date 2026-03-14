import { useParams } from "react-router-dom";
import { useEffect,useState } from "react";
import axios from "axios";

function EventDetails(){

const {id} = useParams();

const [event,setEvent] = useState(null);

useEffect(()=>{

axios.get(`http://localhost:5000/events/${id}`)
.then(res=>setEvent(res.data))
.catch(err=>console.log(err));

},[id]);

if(!event) return <h2>Loading...</h2>;

return(

<div className="details-container">

<div className="image-gallery">

{event.images?.map((img,i)=>(

<img
key={i}
src={`http://localhost:5000/uploads/${img}`}
className="event-img"
alt="event"
/>

))}

</div>

<h1>{event.title}</h1>

<p>{event.description}</p>

<p>
<b>Date:</b>
{new Date(event.date).toLocaleDateString()}
</p>

<p><b>Time:</b> {event.time}</p>

<p><b>Location:</b> {event.location}</p>

</div>

);

}

export default EventDetails;