import React from "react";

const Dashboard = () => {
  return (
    <div
      className="position-relative vh-100 vw-100"
      style={{
        backgroundImage: `url("/images/hospital6.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white text-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "1rem",
        }}
      >
        <h1 className="display-3 fw-bold">Hospital Portal Dashboard</h1>
        <p className="fs-4">Select a section from the navigation or login.</p>
      </div>
    </div>
  );
};

export default Dashboard;
