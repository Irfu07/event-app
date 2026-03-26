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

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/events");
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  /* ================= FILTER ================= */

  const filteredEvents = events.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || event.category === category;
    return matchSearch && matchCategory;
  });

  /* ================= UI ================= */

  return (
    <div className="container">

      <h2 className="title">🎉 Nearby Events</h2>

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

                {/* EDIT BUTTON — only for creator or admin */}
                {isOwner && (
                  <button
                    className="btn btn-primary"
                    style={{ background: "#f0a500" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${event._id}`);
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}

                {/* DELETE BUTTON — only for creator or admin */}
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