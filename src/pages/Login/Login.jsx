import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api"; // ✅ This is your axios instance
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reception");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/auth", { email, password }); // ✅ Fixed line

      console.log("Login response:", res.data);

      if (res.data && res.data.token && res.data.user) {
        const { token, user } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        switch (user.role) {
          case "reception":
            navigate("/reception");
            break;
          case "consultation":
            navigate("/consultation");
            break;
          case "payment":
            navigate("/payment");
            break;
          case "department":
            const departmentSlug = user.department
              ? user.department.toLowerCase().replace(/\s+/g, "-")
              : "general";
            localStorage.setItem("department", user.department || "general");
            navigate(`/department/${departmentSlug}`);
            break;
          case "laboratory":
            navigate("/laboratory");
            break;
          case "pharmacy":
            navigate("/pharmacy");
            break;
          default:
            navigate("/");
            break;
        }
      } else {
        alert("Invalid response from server.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow w-100" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Hospital Portal Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label>Email:</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group mb-3">
            <label>Password:</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group mb-4">
            <label>Select Role:</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="reception">Reception</option>
              <option value="consultation">Consultation Doctor</option>
              <option value="payment">Payment Office</option>
              <option value="department">Department Doctor</option>
              <option value="laboratory">Laboratory</option>
              <option value="pharmacy">Pharmacy</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
