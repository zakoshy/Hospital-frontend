import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Consultation = () => {
  const [search, setSearch] = useState('');
  const [patient, setPatient] = useState(null);
  const [complaint, setComplaint] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await api.get(`/api/patients/search/${search}`);
      console.log("Fetched patient →", response.data);
      setPatient(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Patient not found.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!department) {
      alert("Please select a department.");
      return;
    }

    try {
      const data = {
        patientId: patient._id,
        complaints: complaint,
        referredDepartment: department,
      };

      console.log("Submitting consultation data:", data);

      await api.post(`/api/consultations/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(`Patient referred to ${department} department`);

      setComplaint('');
      setDepartment('');

      const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');
      navigate(`/department/${slugify(department)}`);
    } catch (error) {
      console.error('Referral failed:', error.response?.data || error.message);
      alert('Could not refer patient.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Consultation Room</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="row mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <button className="btn btn-primary w-100" type="submit">
            Search Patient
          </button>
        </div>
      </form>

      {/* Display Patient Info */}
      {patient && (
        <div className="card p-3 mb-4">
          <h5>Patient Information</h5>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>ID:</strong> {patient.idNumber || 'N/A'}</p>
          <p><strong>Phone:</strong> {patient.phone || 'N/A'}</p>
          <p><strong>Age:</strong> {patient.age || 'N/A'}</p>
        </div>
      )}

      {/* Complaint + Referral */}
      {patient && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Complaint / Symptoms</label>
            <textarea
              className="form-control"
              rows="3"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Refer to Department</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {[
                "General Medicine",
                "Pediatrics",
                "ENT",
                "Dermatology",
                "Gynecology",
                "Orthopedics",
                "Cardiology",
                "Neurology",
                "Psychiatry",
                "Urology",
                "Oncology",
                "Ophthalmology",
                "Dental",
                "Radiology",
                "Emergency",
                "Surgery",
                "Physiotherapy"
              ].map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Refer Patient
          </button>
        </form>
      )}
    </div>
  );
};

export default Consultation;
