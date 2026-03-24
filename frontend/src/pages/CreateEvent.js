import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CreateEvent.css";

function CreateEvent() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [event, setEvent] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    time: "",
    location: ""
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value
    });
  };

  /* ================= IMAGE PREVIEW ================= */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  /* ================= CREATE EVENT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login first");
      navigate("/auth");
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(event).forEach((key) => {
        formData.append(key, event[key]);
      });

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await axios.post(
        "http://localhost:5000/events",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ JWT token sent correctly
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Event Created Successfully 🎉");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Error creating event ❌"
      );
    }
  };

  /* ================= ROLE PROTECTION ================= */

  if (role !== "creator" && role !== "admin") {
    return (
      <div className="container">
        <h2 style={{ textAlign: "center" }}>
          ❌ Only Creator or Admin can create events
        </h2>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="container">
      <div className="card">
        <h2>Create Event</h2>

        <form onSubmit={handleSubmit} className="event-form">

          <input
            name="title"
            placeholder="Title"
            value={event.title}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={event.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option>College</option>
            <option>Music</option>
            <option>Sports</option>
            <option>Festival</option>
          </select>

          <textarea
            name="description"
            placeholder="Event description..."
            value={event.description}
            onChange={handleChange}
            required
          />

          <div className="row">
            <input
              type="date"
              name="date"
              value={event.date}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="time"
              value={event.time}
              onChange={handleChange}
              required
            />
          </div>

          <input
            name="location"
            placeholder="Location"
            value={event.location}
            onChange={handleChange}
            required
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {previews.length > 0 && (
            <div className="preview-grid">
              {previews.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="preview-img"
                  alt="preview"
                />
              ))}
            </div>
          )}

          <button className="btn btn-primary">
            Create Event 🚀
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateEvent;