import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {

  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const register = async () => {

    try {

      await axios.post("http://localhost:5000/register", data);

      alert("Registration successful");

      navigate("/login");

    } catch (err) {

      alert(err.response?.data?.message);

    }

  };

  return (
    <div className="container">
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />

      <button onClick={register}>Register</button>
    </div>
  );

}

export default Register;