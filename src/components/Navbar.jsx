import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/"); // Redirect to dashboard
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top px-4">
      <Link className="navbar-brand" to="/">Hospital Portal</Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          {role === "reception" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/reception") ? "active" : ""}`}
                to="/reception"
              >
                Reception
              </Link>
            </li>
          )}
          {role === "payment" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/payment") ? "active" : ""}`}
                to="/payment"
              >
                Payment
              </Link>
            </li>
          )}
          {role === "consultation" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/consultation") ? "active" : ""}`}
                to="/consultation"
              >
                Consultation
              </Link>
            </li>
          )}
          {role === "department" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/department/ENT") ? "active" : ""}`}
                to="/department/ENT"
              >
                Department
              </Link>
            </li>
          )}
          {role === "laboratory" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/laboratory") ? "active" : ""}`}
                to="/laboratory"
              >
                Laboratory
              </Link>
            </li>
          )}
          {role === "pharmacy" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/pharmacy") ? "active" : ""}`}
                to="/pharmacy"
              >
                Pharmacy
              </Link>
            </li>
          )}

          {role ? (
            <li className="nav-item">
              <button className="btn btn-sm btn-light ms-3" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="btn btn-sm btn-light ms-3">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
