import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", data);

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
        <h2>Login</h2>

        <input
          name="email"
          placeholder="Email"
          value={data.email}
          onChange={handleChange}
          className="form-control mb-2"
        />

        {/* PASSWORD WITH SHOW/HIDE */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            className="form-control"
            style={{ paddingRight: "42px", width: "100%" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "18px",
              userSelect: "none"
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button className="btn btn-primary w-100" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;