import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <Router>
      {/* GLOBAL APP BACKGROUND */}
      <div className="app-background">

        {/* Navbar always visible */}
        <Navbar />

        {/* Pages */}
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>

        {/* Toast Messages */}
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
      
    </Router>
    
  );
}

export default App;