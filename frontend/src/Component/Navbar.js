import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333" }}>
      <Link to="/" style={{ color: "white", marginRight: "10px" }}>Home</Link>
      <Link to="/create" style={{ color: "white" }}>Create Event</Link>
    </nav>
  );
}

export default Navbar;