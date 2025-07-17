import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import { TEST_TEMPLATES } from "../../utils/testTemplates";

const labTestsList = Object.keys(TEST_TEMPLATES);

const user = JSON.parse(localStorage.getItem("user"));

const Department = () => {
  const { name } = useParams();

  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);

  const [labReferral, setLabReferral] = useState(false);
  const [labTests, setLabTests] = useState([]);

  const [medicineList, setMedicineList] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [prescriptionList, setPrescriptionList] = useState([]);

  const [showLabReadyOnly, setShowLabReadyOnly] = useState(false);

  const [wards, setWards] = useState([]);
  const [showWardsOverview, setShowWardsOverview] = useState(false);
  const [showAdmission, setShowAdmission] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [beds, setBeds] = useState([]);

  const [labSearchTerm, setLabSearchTerm] = useState("");

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchVisits();
    fetchMedicines();
  }, [name]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredVisits(
      visits.filter(
        (v) =>
          v.name.toLowerCase().includes(term) ||
          (v.idNumber && v.idNumber.toLowerCase().includes(term))
      )
    );
  };

  const fetchVisits = async () => {
    try {
      const res = await api.get(`/api/departments/${name}/list`);
      if (Array.isArray(res.data)) {
        const activeVisits = res.data
          .filter((v) => v.status !== "complete")
          .map((v) => ({
            ...v,
            department: v.department || name,
          }));
        setVisits(activeVisits);
        setFilteredVisits(activeVisits);
      } else {
        setVisits([]);
        setFilteredVisits([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch patients:", error);
      alert("No patients found for this department.");
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await api.get(`/api/pharmacy/medicines`);
      setMedicineList(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load medicine list.");
    }
  };

  const handleShowAllWards = async () => {
    if (!showWardsOverview) {
      try {
        const res = await api.get(`/api/wards`);
        setWards(res.data);
        setShowWardsOverview(true);
      } catch (error) {
        console.error("❌ Failed to fetch wards:", error);
        alert("Could not load wards.");
      }
    } else {
      setShowWardsOverview(false);
      setSelectedWard(null);
      setBeds([]);
    }
  };

  const handleWardOverviewBeds = async (ward) => {
    try {
      const res = await api.get(`/api/wards/${ward._id}/beds`);
      setSelectedWard(ward);
      setBeds(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch beds:", error);
      alert("Could not load beds.");
    }
  };

  const handleAdmitClick = async () => {
    try {
      const res = await api.get(`/api/wards`);
      setWards(res.data);
      setShowAdmission(true);
    } catch (error) {
      console.error("❌ Failed to fetch wards:", error);
      alert("Could not load wards. Try again.");
    }
  };

  const handleWardSelect = async (ward) => {
    try {
      const res = await api.get(`/api/wards/${ward._id}/beds`);
      setBeds(res.data);
      setSelectedWard(ward);
    } catch (error) {
      console.error("❌ Failed to fetch beds:", error);
      alert("Could not load beds.");
    }
  };

  const handleBedSelect = async (bed) => {
    try {
      await api.post(`/api/admissions`, {
        patientId: selectedVisit.patientId,
        wardId: selectedWard._id,
        bedId: bed._id,
        department: name,
        admittedBy: user.name,
      });

      await api.put(`/api/departments/${selectedVisit._id}/status`, {
        status: "admitted",
      });

      alert(`✅ Patient admitted to ${selectedWard.name}, Bed ${bed.bedNumber}`);

      const updatedVisits = visits.map((v) =>
        v._id === selectedVisit._id ? { ...v, status: "admitted" } : v
      );
      setVisits(updatedVisits);
      setFilteredVisits(updatedVisits);
      setSelectedVisit({
        ...selectedVisit,
        status: "admitted",
      });

      setShowAdmission(false);
      setSelectedWard(null);
      setBeds([]);
    } catch (error) {
      console.error("❌ Admission failed:", error);
      alert("Failed to admit patient.");
    }
  };

  const handleDischarge = async () => {
    if (!selectedVisit) return;
    try {
      await api.put(`/api/discharge/${selectedVisit.patientId}`);
      const updatedVisits = visits.map((v) =>
        v._id === selectedVisit._id
          ? { ...v, status: "lab_results_ready" }
          : v
      );
      setVisits(updatedVisits);
      setFilteredVisits(updatedVisits);
      setSelectedVisit({
        ...selectedVisit,
        status: "lab_results_ready",
      });
      alert("✅ Patient discharged from ward.");
    } catch (error) {
      console.error("❌ Discharge failed:", error);
      alert("Failed to discharge patient.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return alert("No patient selected.");
    try {
      if (labReferral) {
        await api.post(`/api/laboratory-referrals/referrals`, {
          patientId: selectedVisit.patientId,
          department: name,
          testsRequested: labTests,
        });
        await api.put(`/api/departments/${selectedVisit._id}/status`, {
          status: "waiting_lab_results",
        });
        alert("Patient referred to Lab.");
      } else {
        if (prescriptionList.length === 0) {
          alert("Please add at least one medicine.");
          return;
        }
        await api.post(`/api/prescriptions/create`, {
          patientId: selectedVisit.patientId,
          department: name,
          prescribedBy: user.name,
          medications: prescriptionList,
        });
        if (selectedVisit.status === "admitted") {
          await api.put(
            `/api/admissions/${selectedVisit.patientId}/discharge`
          );
        }
        await api.put(`/api/departments/${selectedVisit._id}/status`, {
          status: "complete",
        });
        alert("Prescription sent to Pharmacy.");
      }
      const updatedList = visits.filter(
        (v) => v._id !== selectedVisit._id
      );
      setVisits(updatedList);
      setFilteredVisits(updatedList);
      setSelectedVisit(null);
      setLabReferral(false);
      setLabTests([]);
      setPrescriptionList([]);
      setMedicineSearchTerm("");
      setShowAdmission(false);
      setSelectedWard(null);
      setBeds([]);
    } catch (error) {
      console.error("❌ Submission failed:", error);
      alert("Failed to proceed. Try again.");
    }
  };

  const fetchLabResults = async (visit) => {
    try {
      const departmentToUse = visit.department || name;
      if (!departmentToUse) {
        alert("Cannot load lab results: department missing.");
        return;
      }
      const res = await api.get(
        `/api/laboratory-referrals/results/${visit.patientId}`,
        {
          params: {
            department: departmentToUse,
          },
        }
      );
      console.log("✅ LAB RESULTS:", res.data);
      setSelectedVisit({
        ...visit,
        department: departmentToUse,
        labResults:
          res.data && typeof res.data === "object" ? res.data : {},
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log("⚠️ No lab results found for this visit.");
        setSelectedVisit({
          ...visit,
          department: visit.department || name,
          labResults: {},
        });
      } else {
        console.error("❌ Failed to load lab results:", err);
        alert("Failed to load lab results.");
      }
    }
  };

  const handleSelectVisit = (visit) => {
    if (selectedVisit && selectedVisit._id === visit._id) {
      setSelectedVisit(null);
      return;
    }
    if (
      visit.status === "lab_results_ready" &&
      (!visit.labResults || Object.keys(visit.labResults).length === 0)
    ) {
      fetchLabResults(visit);
    } else {
      setSelectedVisit(visit);
    }
  };

  const handleLabSearchChange = (e) => {
    setLabSearchTerm(e.target.value);
  };

  const filteredLabTests = labTestsList.filter((test) =>
    test.toLowerCase().includes(labSearchTerm.toLowerCase())
  );

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={`container mt-4 ${
        theme === "dark" ? "bg-dark text-light" : ""
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{name} Department</h2>
        <button
          className={`btn ${
            theme === "dark" ? "btn-light" : "btn-dark"
          }`}
          onClick={toggleTheme}
        >
          Switch to {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>

      <button
        className="btn btn-info mb-3"
        onClick={handleShowAllWards}
      >
        {showWardsOverview
          ? "Hide Wards & Beds"
          : "View All Wards & Beds"}
      </button>

      {showWardsOverview && (
        <div className="card p-3 mb-3">
          <h5 className="text-info">Wards & Beds Overview</h5>
          {wards.map((ward) => (
            <div key={ward._id} className="mb-3">
              <h6>{ward.name}</h6>
              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => handleWardOverviewBeds(ward)}
              >
                View Beds
              </button>
            </div>
          ))}

          {selectedWard && (
            <div className="mt-3">
              <h6>Beds in {selectedWard.name}</h6>
              <div className="d-flex flex-wrap gap-2">
                {[...beds]
                  .sort((a, b) => a.bedNumber - b.bedNumber)
                  .map((bed) => (
                    <span
                      key={bed._id}
                      className={`badge ${
                        bed.isOccupied ? "bg-danger" : "bg-success"
                      }`}
                    >
                      Bed {bed.bedNumber}{" "}
                      {bed.isOccupied ? "(Occupied)" : "(Available)"}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search patient by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {filteredVisits.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <div className="list-group mb-4">
          {filteredVisits.map((visit) => (
            <div
              key={visit._id}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                selectedVisit?._id === visit._id ? "active" : ""
              }`}
            >
              <span
                style={{ cursor: "pointer", flexGrow: 1 }}
                onClick={() => handleSelectVisit(visit)}
              >
                {visit.name} — {visit.idNumber} — Status:{" "}
                {visit.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedVisit && (
  <form onSubmit={handleSubmit}>
    <div className="card p-3 mb-3">
      <h5>Patient Details</h5>
      <p>
        <strong>Name:</strong> {selectedVisit.name}
      </p>
      <p>
        <strong>ID:</strong> {selectedVisit.idNumber}
      </p>
      <p>
        <strong>Status:</strong> {selectedVisit.status}
      </p>

      {selectedVisit.labResults &&
        Object.keys(selectedVisit.labResults).length > 0 && (
          <div className="card p-3 mb-3 border-success">
            <h5 className="text-success">Lab Results</h5>
            {Object.entries(selectedVisit.labResults).map(
              ([test, values]) => (
                <div key={test}>
                  <strong>{test}</strong>
                  {typeof values === "object" &&
                  values !== null ? (
                    <ul>
                      {Object.entries(values).map(
                        ([k, v]) => (
                          <li key={k}>
                            {k}: {v}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>{values}</p>
                  )}
                </div>
              )
            )}
          </div>
        )}

      {selectedVisit.status === "pending" && !labReferral && (
        <button
          type="button"
          className="btn btn-outline-success w-100 mb-3"
          onClick={() => setLabReferral(true)}
        >
          Send to Lab
        </button>
      )}

      <button
        type="button"
        className="btn btn-warning w-100 mt-2"
        onClick={handleAdmitClick}
        disabled={selectedVisit.status === "admitted"}
      >
        {selectedVisit.status === "admitted"
          ? "Patient Already Admitted"
          : "Admit Patient"}
      </button>
    </div>

          {showAdmission && (
            <div className="card p-3 mb-3 border-warning">
              <h5 className="text-warning">Select Ward</h5>
              <div className="d-flex flex-wrap gap-2">
                {wards.map((ward) => (
                  <button
                    key={ward._id}
                    className="btn btn-outline-warning"
                    onClick={() => handleWardSelect(ward)}
                  >
                    {ward.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedWard && (
            <div className="card p-3 mb-3 border-primary">
              <h5 className="text-primary">
                Beds in {selectedWard.name}
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {[...beds]
                  .sort((a, b) => a.bedNumber - b.bedNumber)
                  .map((bed) => (
                    <button
                      key={bed._id}
                      disabled={bed.isOccupied}
                      className={`btn ${
                        bed.isOccupied
                          ? "btn-secondary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => handleBedSelect(bed)}
                    >
                      Bed {bed.bedNumber}{" "}
                      {bed.isOccupied
                        ? "(Occupied)"
                        : "(Available)"}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {labReferral && (
            <>
              <label className="form-label mt-3">
                Search Lab Test
              </label>
              <input
                type="text"
                className="form-control mb-2"
                value={labSearchTerm}
                onChange={handleLabSearchChange}
                placeholder="Type to filter lab tests..."
              />

              <label className="form-label">
                Select Lab Tests
              </label>
              <select
                multiple
                className="form-select"
                value={labTests}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setLabTests(selected);
                }}
                required
              >
                {filteredLabTests.map((test, idx) => (
                  <option key={idx} value={test}>
                    {test}
                  </option>
                ))}
              </select>
            </>
          )}
           {selectedVisit && !labReferral && (
        <div className="card p-3 mb-3">
          <h5>Prescription</h5>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search medicine..."
            value={medicineSearchTerm}
            onChange={handleMedicineSearch}
          />
          {medicineSuggestions.length > 0 && (
            <ul className="list-group">
              {medicineSuggestions.map((med) => (
                <li
                  key={med._id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleAddMedicine(med)}
                  style={{ cursor: "pointer" }}
                >
                  {med.name} — {med.form} — {med.strength}
                </li>
              ))}
            </ul>
          )}
          {prescriptionList.length > 0 && (
            <div className="mt-3">
              <h6>Prescribed Medicines:</h6>
              <ul>
                {prescriptionList.map((med, idx) => (
                  <li key={idx}>
                    {med.name} — {med.form} — {med.strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
          >
            {labReferral ? "Send to Lab" : "Send to Pharmacy"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Department;
