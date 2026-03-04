import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const register = async () => {
    await axios.post("http://localhost:5000/register", data);
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        
        <select name="role" onChange={handleChange}>
          <option value="viewer">Viewer</option>
          <option value="creator">Creator</option>
        </select>

        <button className="btn btn-primary" onClick={register}>Register</button>
      </div>
    </div>
  );
}

export default Register;