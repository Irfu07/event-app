import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function CreatorProfile() {

  const { id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/creator/${id}`)
      .then(res => setEvents(res.data))
      .catch(err => console.log(err));
  }, [id]);

  return (
    <div className="container">

      <h2>Creator Events</h2>

      {events.length === 0 && <p>No events found</p>}

      {events.map(event => (
        <div key={event._id} className="card">

          {/* IMAGES */}
          {event.images?.length > 0 && (
            <img
              src={`http://localhost:5000/uploads/${event.images[0]}`}
              alt="event"
              className="event-img"
            />
          )}

          <h3>{event.title}</h3>

          <p><b>Category:</b> {event.category}</p>

          <p>
            <b>Date:</b> {new Date(event.date).toLocaleDateString()}
          </p>

          <p><b>Time:</b> {event.time}</p>

          <p><b>Location:</b> {event.location}</p>

          <p><b>Hosted By:</b> {event.hostedBy || "Not specified"}</p>

          <p>
            <b>⭐ Interested:</b> {event.interestedUsers?.length || 0} people
          </p>

          {/* GOOGLE MAPS BUTTON */}
          {event.lat && event.lng && (
            <a
              href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "8px 16px",
                background: "#4285F4",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              🗺️ Open in Google Maps
            </a>
          )}

        </div>
      ))}

    </div>
  );
}

export default CreatorProfile;