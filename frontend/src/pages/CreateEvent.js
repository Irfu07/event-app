import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import '.styles/CreateEvent.css';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
    location: "",
    hostedBy: "",
    lat: "",
    lng: ""
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState([26.8467, 80.9462]);
  const [markerPos, setMarkerPos] = useState(null);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE PREVIEW ================= */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  /* ================= LOCATION SEARCH ================= */

  const handleLocationSearch = async (e) => {
    const query = e.target.value;
    setEvent((prev) => ({ ...prev, location: query }));

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            "Accept": "application/json",
            "Accept-Language": "en"
          }
        }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.log("Location search error:", err);
      setSuggestions([]);
    }
  };

  /* ================= SELECT SUGGESTION ================= */

  const selectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setEvent((prev) => ({
      ...prev,
      location: place.display_name,  // ✅ sets input value correctly
      lat: place.lat,
      lng: place.lon
    }));

    setMapCenter([lat, lon]);
    setMarkerPos([lat, lon]);
    setSuggestions([]);  // ✅ hides dropdown
  };

  /* ================= GPS LOCATION ================= */

  const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept": "application/json",
              "Accept-Language": "en"
            }
          }
        );
        const data = await res.json();

        setEvent((prev) => ({
          ...prev,
          location: data.display_name,
          lat,
          lng
        }));
        setMapCenter([lat, lng]);
        setMarkerPos([lat, lng]);
      } catch (err) {
        console.log("Reverse geocode error:", err);
        setEvent((prev) => ({ ...prev, lat, lng }));
        setMapCenter([lat, lng]);
        setMarkerPos([lat, lng]);
      }
    });
  };

  /* ================= MAP CLICK HANDLER ================= */

  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                "Accept": "application/json",
                "Accept-Language": "en"
              }
            }
          );
          const data = await res.json();

          setEvent((prev) => ({
            ...prev,
            location: data.display_name,
            lat,
            lng
          }));
          setMapCenter([lat, lng]);
          setMarkerPos([lat, lng]);
        } catch (err) {
          console.log("Map click geocode error:", err);
          setEvent((prev) => ({ ...prev, lat, lng }));
          setMapCenter([lat, lng]);
          setMarkerPos([lat, lng]);
        }
      }
    });
    return null;
  }

  /* ================= RECENTER MAP ================= */

  function RecenterMap({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.setView(center, 15);
    }, [center, map]);
    return null;
  }

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
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Event Created Successfully 🎉");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error creating event ❌");
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

          {/* TITLE */}
          <input
            name="title"
            placeholder="Title"
            value={event.title}
            onChange={handleChange}
            required
          />

          {/* CATEGORY */}
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

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Event description..."
            value={event.description}
            onChange={handleChange}
            required
          />

          {/* DATE & TIME */}
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

          {/* HOSTED BY */}
          <input
            name="hostedBy"
            placeholder="Hosted By (e.g. organizer name)"
            value={event.hostedBy}
            onChange={handleChange}
            required
          />

          {/* LOCATION SEARCH */}
          <div style={{ position: "relative" }}>
            <input
              name="location"
              placeholder="Search location..."
              value={event.location}
              onChange={handleLocationSearch}
              required
              autoComplete="off"
            />

            {suggestions.length > 0 && (
              <div style={{
                position: "absolute",
                background: "white",
                border: "1px solid #ccc",
                width: "100%",
                zIndex: 1000,
                maxHeight: "200px",
                overflowY: "auto",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                {suggestions.map((place, i) => (
                  <div
                    key={i}
                    onClick={() => selectSuggestion(place)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      textAlign: "left",
                      fontSize: "13px"
                    }}
                    onMouseEnter={e => e.target.style.background = "#f0f0f0"}
                    onMouseLeave={e => e.target.style.background = "white"}
                  >
                    {place.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GPS BUTTON */}
          <button
            type="button"
            onClick={getMyLocation}
            className="btn btn-primary"
            style={{ marginBottom: "10px" }}
          >
            📍 Use My Location
          </button>

          {/* MAP */}
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{
              height: "300px",
              width: "100%",
              borderRadius: "12px",
              zIndex: 1,
              marginBottom: "10px"
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            <RecenterMap center={mapCenter} />
            {markerPos && <Marker position={markerPos} />}
          </MapContainer>

          {/* COORDINATES DISPLAY */}
          {event.lat && (
            <p style={{ fontSize: "12px", color: "gray", marginBottom: "10px" }}>
              📌 {parseFloat(event.lat).toFixed(4)}, {parseFloat(event.lng).toFixed(4)}
            </p>
          )}

          {/* IMAGE UPLOAD */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {previews.length > 0 && (
            <div className="preview-grid">
              {previews.map((img, i) => (
                <img key={i} src={img} className="preview-img" alt="preview" />
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