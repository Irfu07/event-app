import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import SelectRole from "./pages/SelectRole";
import Auth from "./pages/auth";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import CreatorProfile from "./pages/CreatorProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App(){

const [token,setToken] = useState(null);

useEffect(()=>{
setToken(localStorage.getItem("token"));
},[]);

return(

<Router>

<div className="app-background">

<Navbar/>

<div className="page-container">

<Routes>

<Route path="/" element={<SelectRole/>} />

<Route path="/auth" element={<Auth/>} />
<Route path="/forgot-password" element={<ForgotPassword/>} />

<Route path="/reset-password/:token" element={<ResetPassword/>} />
<Route
path="/dashboard"
element={token ? <Dashboard/> : <Navigate to="/auth"/>}
/>

<Route
path="/create"
element={token ? <CreateEvent/> : <Navigate to="/auth"/>}
/>

<Route
path="/event/:id"
element={token ? <EventDetails/> : <Navigate to="/auth"/>}
/>

<Route
path="/creator/:id"
element={token ? <CreatorProfile/> : <Navigate to="/auth"/>}
/>

</Routes>

</div>

<ToastContainer position="top-right" autoClose={2000} />

</div>

</Router>

);

}

export default App;