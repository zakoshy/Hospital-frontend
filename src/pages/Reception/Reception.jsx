import React, { useState } from 'react';
import api from '../../utils/api';

const Reception = () => {
  const [searchId, setSearchId] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    idNumber: '',
    phone: ''
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    try {
      const response = await api.get(`/api/patients/search/${searchId}`);
      if (response.data) {
        setFoundPatient(response.data);
        setIsExisting(true);
        setMessage('');
      } else {
        setIsExisting(false);
        setFoundPatient(null);
        setMessage('Patient not found. Please register.');
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      if (error.response?.status === 401) {
        setMessage("Session expired. Please log in again.");
      } else {
        setMessage('Patient not found. Please register.');
      }
    }
  };

  const handleChange = e => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleRegister = async e => {
    e.preventDefault();

    if (!patientData.name || !patientData.phone) {
      alert("Name and phone are required.");
      return;
    }

    try {
      const response = await api.post('/api/patients/register', patientData);
      console.log("Registered patient:", response.data);

      setPatientData({
        name: '',
        age: '',
        idNumber: '',
        phone: ''
      });
      setMessage('Patient registered successfully!');
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.response?.status === 401) {
        setMessage("Session expired. Please log in again.");
      } else {
        alert("Failed to register patient.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Reception - Patient Check-in</h2>

      {message && (
        <div className="alert alert-info">{message}</div>
      )}

      <div className="card p-4 mb-4">
        <h5>Search for Patient</h5>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter ID Number"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
        {isExisting && foundPatient && (
          <div className="alert alert-success mt-3">
            <p><strong>Patient Found:</strong></p>
            <p>Name: {foundPatient.name}</p>
            <p>Phone: {foundPatient.phone}</p>
            <button
              className="btn btn-success"
              onClick={() => {
                setMessage('Ready for consultation. Patient data loaded.');
              }}
            >
              Proceed to Consultation
            </button>
          </div>
        )}
      </div>

      <div className="card p-4">
        <h5>Register New Patient</h5>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={patientData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-control"
              name="age"
              value={patientData.age}
              onChange={handleChange}
            />
          </div>

          {parseInt(patientData.age) >= 18 && (
            <div className="mb-3">
              <label className="form-label">ID Number</label>
              <input
                type="text"
                className="form-control"
                name="idNumber"
                value={patientData.idNumber}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={patientData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Register Patient
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reception;
