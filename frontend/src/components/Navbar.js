import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* LOGO */}
      <h2 className="logo">🎉 Nearby Events</h2>

      {/* MOBILE MENU ICON */}
      <div
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* NAV LINKS */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link
          to="/"
          className={`nav-btn ${
            location.pathname === "/" ? "active" : ""
          }`}
        >
          Home
        </Link>

        <Link
          to="/create"
          className={`nav-btn create ${
            location.pathname === "/create" ? "active" : ""
          }`}
        >
          Create Event
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;