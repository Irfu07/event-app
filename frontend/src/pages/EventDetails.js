import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function EventDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!event) return <h2>Loading...</h2>;

  return (
    <div className="details-container">

      {/* IMAGE GALLERY */}
      <div className="image-gallery">
        {event.images?.map((img, i) => (
          <img
            key={i}
            src={`http://localhost:5000/uploads/${img}`}
            className="event-img"
            alt="event"
          />
        ))}
      </div>

      {/* TITLE */}
      <h1>{event.title}</h1>

      {/* HOSTED BY */}
      <p>
        <b>Hosted By:</b> {event.hostedBy || "Not specified"}
      </p>

      {/* DESCRIPTION */}
      <p>{event.description}</p>

      {/* CATEGORY */}
      <p><b>Category:</b> {event.category}</p>

      {/* DATE */}
      <p>
        <b>Date:</b> {new Date(event.date).toLocaleDateString()}
      </p>

      {/* TIME */}
      <p><b>Time:</b> {event.time}</p>

      {/* LOCATION */}
      <p><b>Location:</b> {event.location}</p>

      {/* GOOGLE MAPS BUTTON */}
      {event.lat && event.lng && (
        <a
          href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: "8px",
            padding: "10px 20px",
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

      {/* INTERESTED COUNT */}
      <p style={{ marginTop: "12px" }}>
        <b>⭐ Interested:</b> {event.interestedUsers?.length || 0} people
      </p>

      {/* CREATOR */}
      <p
        style={{ cursor: "pointer", color: "#6c63ff", marginTop: "8px" }}
        onClick={() => navigate(`/creator/${event.creatorId}`)}
      >
        <b>Creator:</b> {event.creatorName || "Organizer"}
      </p>

    </div>
  );
}

export default EventDetails;