import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function Auth({ setToken }) {

  const navigate = useNavigate();

  const [type, setType] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  /* ================= GET ROLE FROM SELECT ROLE PAGE ================= */

  useEffect(() => {
    const role = localStorage.getItem("selectedRole");
    if (role) {
      setData((prev) => ({ ...prev, role }));
    }
  }, []);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  /* ================= SUBMIT LOGIN / REGISTER ================= */

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/auth",
        { ...data, type }
      );

      /* ===== LOGIN SUCCESS ===== */
      if (type === "login") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("name", res.data.name);

        setToken(res.data.token);

        navigate("/dashboard");
      }

      /* ===== REGISTER SUCCESS ===== */
      else {
        alert("✅ Registration successful. Please login.");

        setType("login");

        setData({
          name: "",
          email: "",
          password: "",
          role: data.role
        });
      }

    } catch (err) {
      alert(
        err.response?.data?.message || "❌ Authentication failed"
      );
    }
  };

  /* ================= UI ================= */

  return (
    <div className="auth-wrapper">

      <form className="container" onSubmit={submit}>

        <h2>{type === "login" ? "Login" : "Register"}</h2>

        {type === "register" && (
          <input
            name="name"
            placeholder="Name"
            value={data.name}
            onChange={handleChange}
            required
          />
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={handleChange}
          required
        />

        {/* PASSWORD WITH SHOW/HIDE */}
        <div style={{ position: "relative" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            required
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

        {type === "register" && (
          <select
            name="role"
            value={data.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>
        )}

        <button type="submit">
          {type === "login" ? "Login" : "Register"}
        </button>

        <p
          className="toggle"
          onClick={() =>
            setType(type === "login" ? "register" : "login")
          }
        >
          {type === "login" ? "Create account" : "Already have an account"}
        </p>

        <p onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </p>

      </form>

    </div>
  );
}

export default Auth;