//REMOVE THESE LINES
//import { Swiper, SwiperSlide } from "swiper/react";
//import { Navigation, Pagination } from "swiper/modules";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CreateEvent.css";
//import "swiper/css";
//import "swiper/css/navigation";
//import "swiper/css/pagination";

function CreateEvent() {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImageFiles(files);

    const previewUrls = files.map(file =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.keys(event).forEach(key => {
      formData.append(key, event[key]);
    });

    imageFiles.forEach(file => {
      formData.append("images", file);
    });

    await axios.post(
      "http://localhost:5000/events",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert("Event Created ✅");
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Event</h2>

        <form onSubmit={handleSubmit} className="event-form">

          <input name="title" placeholder="Title"
            value={event.title} onChange={handleChange} required />

          <select name="category"
            value={event.category}
            onChange={handleChange} required>
            <option value="">Select Category</option>
            <option>College</option>
            <option>Music</option>
            <option>Sports</option>
            <option>Festival</option>
          </select>

          <textarea name="description"
            placeholder="Event description..."
            value={event.description}
            onChange={handleChange} required />

          <div className="row">
            <input type="date" name="date"
              value={event.date}
              onChange={handleChange} required />

            <input type="time" name="time"
              value={event.time}
              onChange={handleChange} required />
          </div>

          <input name="location"
            placeholder="Location"
            value={event.location}
            onChange={handleChange} required />

          {/* MULTIPLE IMAGE INPUT */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* INSTAGRAM GRID PREVIEW */}
         
          <button className="btn btn-primary">
            Create Event 🚀
          </button>

        </form>
      </div>
    </div>
    
  );
}

export default CreateEvent;