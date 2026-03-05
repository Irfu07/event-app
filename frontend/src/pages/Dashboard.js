import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import API from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loadingId, setLoadingId] = useState(null);

  // ⭐ Fake logged user (later from login system)
  const userId = "user1";

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ================= DELETE EVENT ================= */
  const deleteEvent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    await axios.delete(`${API}/events/${id}`);
    fetchEvents();
  };

  /* ================= INTERESTED TOGGLE ================= */
  const interestedEvent = async (id) => {
    try {
      setLoadingId(id);

      const res = await axios.put(`${API}/events/interested/${id}`, { userId });

      // update only clicked event
      setEvents((prev) =>
        prev.map((ev) => (ev._id === id ? res.data : ev))
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= FILTER ================= */
  const filteredEvents = events.filter((event) => {
    const matchSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || event.category === category;

    return matchSearch && matchCategory;
  });

  return (
    <div className="container">
      <h2 className="title">🎉 Nearby Events</h2>

      {/* SEARCH + FILTER */}
      <div className="filters">
        <input
          placeholder="🔍 Search event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All</option>
          <option>College</option>
          <option>Music</option>
          <option>Sports</option>
          <option>Festival</option>
        </select>
      </div>

      {/* EVENTS GRID */}
      <div className="event-grid">
        {filteredEvents.map((event) => {

          // ✅ MUST be inside map
          const isInterested =
            event.interestedUsers?.includes(userId);

          return (
            <div
              className="card"
              key={event._id}
              onClick={() => navigate(`/event/${event._id}`)}
            >
              {/* IMAGE SLIDER */}
              {event.images && event.images.length > 0 && (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="event-slider"
                >
                  {event.images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={`${API}/uploads/${img}`}
                        alt="event"
                        className="event-img"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              <h3>{event.title}</h3>

              <p><b>Category:</b> {event.category}</p>

              <p>
                <b>Date:</b>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>

              <p><b>Location:</b> {event.location}</p>

              <div className="btn-group">

                {/* ⭐ INTEREST BUTTON */}
                <button
                  className={`btn ${
                    isInterested
                      ? "btn-success"
                      : "btn-primary"
                  }`}
                  disabled={loadingId === event._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    interestedEvent(event._id);
                  }}
                >
                  {loadingId === event._id
                    ? "Updating..."
                    : `⭐ Interested (${event.interestedUsers?.length || 0})`}
                </button>

                {/* DELETE */}
                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEvent(event._id);
                  }}
                >
                  🗑️ Delete
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
