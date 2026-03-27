import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination } from "swiper/modules";

function Dashboard() {

  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loadingId, setLoadingId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  /* ================= FETCH EVENTS ================= */

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/events");
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= GET USER LOCATION ================= */

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.log("Location denied:", err);
        }
      );
    }
  };

  useEffect(() => {
    fetchEvents();
    getUserLocation();
  }, []);

  /* ================= DISTANCE CALCULATOR ================= */

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /* ================= DELETE ================= */

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    await axios.delete(`http://localhost:5000/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchEvents();
  };

  /* ================= INTERESTED ================= */

  const interestedEvent = async (id) => {
    try {
      setLoadingId(id);

      const res = await axios.put(
        `http://localhost:5000/events/interested/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents(prev =>
        prev.map(ev => ev._id === id ? res.data : ev)
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= FILTER + SORT BY DISTANCE ================= */

  const filteredEvents = events
    .filter(event => {
      const matchSearch = event.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || event.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (userLocation && a.lat && a.lng && b.lat && b.lng) {
        const distA = getDistance(
          userLocation.lat, userLocation.lng,
          parseFloat(a.lat), parseFloat(a.lng)
        );
        const distB = getDistance(
          userLocation.lat, userLocation.lng,
          parseFloat(b.lat), parseFloat(b.lng)
        );
        return distA - distB;
      }
      return 0;
    });

  /* ================= UI ================= */

  return (
    <div className="container">

      <h2 className="title">🎉 Nearby Events</h2>

      {/* LOCATION STATUS */}
      {userLocation ? (
        <p style={{ textAlign: "center", color: "white", fontSize: "13px", marginBottom: "10px" }}>
          📍 Showing events nearest to your location
        </p>
      ) : (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "10px" }}>
          📍 Allow location access to see nearby events first
        </p>
      )}

      <div className="filters">
        <input
          placeholder="Search event"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option>All</option>
          <option>College</option>
          <option>Music</option>
          <option>Sports</option>
          <option>Festival</option>
        </select>
      </div>

      <div className="event-grid">

        {filteredEvents.map(event => {

          const isInterested = event.interestedUsers?.some(
            (u) => u.toString() === userId
          );
          const isOwner = event.creatorId === userId || role === "admin";

          // Calculate distance if location available
          const distance = userLocation && event.lat && event.lng
            ? getDistance(
                userLocation.lat, userLocation.lng,
                parseFloat(event.lat), parseFloat(event.lng)
              ).toFixed(1)
            : null;

          return (
            <div
              className="card"
              key={event._id}
              onClick={() => navigate(`/event/${event._id}`)}
            >

              {/* IMAGE SLIDER */}
              {event.images?.length > 0 && (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="event-slider"
                >
                  {event.images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={`http://localhost:5000/uploads/${img}`}
                        alt="event"
                        className="event-img"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              {/* BADGES */}
              {event.creatorRole === "creator" && (
                <span className="creator-badge">Creator Event</span>
              )}
              {event.creatorRole === "admin" && (
                <span className="admin-badge">Admin Event</span>
              )}

              <h3>{event.title}</h3>

              {/* CREATOR NAME */}
              <p
                className="creator-name"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/creator/${event.creatorId}`);
                }}
              >
                Hosted by: <b>{event.creatorName || "Organizer"}</b>
              </p>

              <p><b>Category:</b> {event.category}</p>
              <p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
              <p><b>Location:</b> {event.location}</p>
              <p><b>Hosted By:</b> {event.hostedBy || "Not specified"}</p>

              {/* DISTANCE BADGE */}
              {distance && (
                <p style={{ color: "#6c63ff", fontSize: "13px", fontWeight: "bold" }}>
                  📍 {distance} km away
                </p>
              )}

              <div className="btn-group">

                {/* INTERESTED BUTTON */}
                <button
                  className={`btn ${isInterested ? "btn-success" : "btn-primary"}`}
                  disabled={loadingId === event._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    interestedEvent(event._id);
                  }}
                >
                  {loadingId === event._id
                    ? "Updating..."
                    : `⭐ Interested (${event.interestedUsers?.length || 0})`
                  }
                </button>

                {/* EDIT BUTTON */}
                {isOwner && (
                  <button
                    className="btn"
                    style={{ background: "#f0a500", color: "white" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${event._id}`);
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}

                {/* DELETE BUTTON */}
                {isOwner && (
                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEvent(event._id);
                    }}
                  >
                    🗑 Delete
                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Dashboard;