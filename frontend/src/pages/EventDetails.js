import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";
function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    axios.get(`${API}/events/${id}`)
      .then(res => setEvent(res.data));
  }, [id]);

  if (!event) return <h2>Loading...</h2>;

  return (
    <div className="details-container">

      {/* IMAGE GALLERY */}
      <div className="image-gallery">
        {event.images?.map((img, i) => (
          <img
            key={i}
            src={`${API}/uploads/${img}`}
            className="event-img"
            alt=""
          />
        ))}
      </div>

      <h1>{event.title}</h1>
      <p>{event.description}</p>

      <p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
      <p><b>Time:</b> {event.time}</p>
      <p><b>Location:</b> {event.location}</p>

    </div>
  );
}

export default EventDetails;