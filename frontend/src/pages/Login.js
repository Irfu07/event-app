import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const login = async () => {
    const res = await axios.post("http://localhost:5000/login", data);
    localStorage.setItem("user", JSON.stringify(res.data));
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <button className="btn btn-primary" onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default Login;