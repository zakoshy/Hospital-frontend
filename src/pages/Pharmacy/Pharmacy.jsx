import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Modal, Button, Form } from "react-bootstrap";

const Pharmacy = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [availability, setAvailability] = useState({});
  const [dischargeData, setDischargeData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // UI states
  const [theme, setTheme] = useState("light");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchPendingPrescriptions();
  }, []);

  const fetchPendingPrescriptions = async () => {
    try {
      const { data } = await api.get(`/api/pharmacy/pending`);
      setPrescriptions(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load pending prescriptions.");
    }
  };

  const handleAvailabilityChange = (prescriptionId, medName, value) => {
    setAvailability((prev) => ({
      ...prev,
      [prescriptionId]: {
        ...(prev[prescriptionId] || {}),
        [medName]: value,
      },
    }));
  };

  const handleFulfill = async (prescriptionId) => {
    const medsForThisPrescription = availability[prescriptionId];

    if (!medsForThisPrescription) {
      alert("Please select availability for medicines.");
      return;
    }

    const fulfilledMeds = Object.entries(medsForThisPrescription).map(
      ([name, status]) => ({
        name,
        available: status === "available",
      })
    );

    try {
      await api.post(`/api/pharmacy/fulfill`, {
        prescriptionId,
        fulfilledMeds,
      });

      alert("Prescription fulfilled!");

      setPrescriptions((prev) =>
        prev.filter((p) => p._id !== prescriptionId)
      );
      setSelectedPrescription(null);
    } catch (error) {
      console.error(error);
      alert("Failed to fulfill prescription.");
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?"))
      return;

    try {
      await api.delete(
        `/api/pharmacy/prescriptions/${prescriptionId}`
      );

      setPrescriptions((prev) =>
        prev.filter((p) => p._id !== prescriptionId)
      );
      alert("Prescription deleted.");

      if (selectedPrescription?._id === prescriptionId) {
        setSelectedPrescription(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete prescription.");
    }
  };

  const handleDischarge = async (prescription) => {
    const medsForThisPrescription = availability[prescription._id] || {};

    const unavailableMeds = Object.entries(medsForThisPrescription)
      .filter(([_, status]) => status === "not_available")
      .map(([name]) => name);

    try {
      await api.post(`/api/pharmacy/discharge`, {
        patientId: prescription.patientId?._id,
        patientName: prescription.patientId?.name,
        phoneNumber: prescription.patientId?.phoneNumber,
        unavailableMeds,
      });

      alert("✅ Patient discharged and SMS sent.");

      setDischargeData({
        patientName: prescription.patientId?.name,
        department: prescription.department,
        unavailableMeds,
      });
      setShowModal(true);

      setPrescriptions((prev) =>
        prev.filter((p) => p._id !== prescription._id)
      );
      setSelectedPrescription(null);
    } catch (error) {
      console.error(error);
      alert("Failed to discharge patient.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectPatient = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleBackToList = () => {
    setSelectedPrescription(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Filtering logic
  const filteredPrescriptions = prescriptions.filter((p) => {
    const name = p.patientId?.name?.toLowerCase() || "";
    const department = p.department?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPrescriptions.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const currentPageData = filteredPrescriptions.slice(
    startIdx,
    startIdx + pageSize
  );

  return (
    <div
      className={`container mt-4 ${theme === "dark" ? "bg-dark text-light" : ""}`}
      style={{ minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pharmacy Dashboard</h2>
        <Button variant={theme === "light" ? "dark" : "light"} onClick={toggleTheme}>
          Toggle {theme === "light" ? "Dark" : "Light"} Mode
        </Button>
      </div>

      {!selectedPrescription ? (
        <>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search by patient name or department..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Form.Group>

          {filteredPrescriptions.length === 0 ? (
            <p className="text-center">✅ No matching prescriptions.</p>
          ) : (
            <>
              <div className="list-group">
                {currentPageData.map((prescription) => (
                  <button
                    key={prescription._id}
                    className={`list-group-item list-group-item-action ${
                      theme === "dark" ? "list-group-item-dark" : ""
                    }`}
                    onClick={() => handleSelectPatient(prescription)}
                  >
                    Patient: {prescription.patientId?.name || "Unknown"} | Dept:{" "}
                    {prescription.department}
                  </button>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="me-2"
                >
                  Previous
                </Button>
                <span className="align-self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="ms-2"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">
                Patient:{" "}
                {selectedPrescription.patientId?.name || "Unknown Patient"}
              </h5>
              <p>
                Prescribed by:{" "}
                <strong>{selectedPrescription.prescribedBy}</strong>
              </p>
              <p>
                Department: <strong>{selectedPrescription.department}</strong>
              </p>

              <h6>Medicines:</h6>
              <ul className="list-group mb-3">
                {selectedPrescription.medications.map((med, idx) => (
                  <li
                    key={idx}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      theme === "dark" ? "list-group-item-dark" : ""
                    }`}
                  >
                    <span>
                      {med.name} — Qty: {med.quantity}
                    </span>
                    <select
                      className="form-select w-auto"
                      onChange={(e) =>
                        handleAvailabilityChange(
                          selectedPrescription._id,
                          med.name,
                          e.target.value
                        )
                      }
                      value={
                        availability[selectedPrescription._id]?.[med.name] ||
                        ""
                      }
                    >
                      <option value="">Select Availability</option>
                      <option value="available">Available</option>
                      <option value="not_available">Not Available</option>
                    </select>
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={() => handleFulfill(selectedPrescription._id)}
                >
                  Fulfill Prescription
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => handleDischarge(selectedPrescription)}
                >
                  Discharge Patient
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedPrescription._id)}
                >
                  Delete Prescription
                </button>
              </div>
              <button
                className="btn btn-secondary mt-3"
                onClick={handleBackToList}
              >
                ⬅ Back to Patient List
              </button>
            </div>
          </div>
        </>
      )}

      {/* Discharge sheet modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Discharge Sheet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dischargeData && (
            <div id="print-area">
              <h5>Patient Discharge Sheet</h5>
              <p><strong>Patient Name:</strong> {dischargeData.patientName}</p>
              <p><strong>Department:</strong> {dischargeData.department}</p>
              <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
              {dischargeData.unavailableMeds.length > 0 ? (
                <>
                  <p><strong>Medicines NOT available in hospital:</strong></p>
                  <ul>
                    {dischargeData.unavailableMeds.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                  <p>
                    Please purchase these medicines from an external pharmacy
                    and follow the doctor's instructions.
                  </p>
                </>
              ) : (
                <p>All prescribed medicines were available and given to patient.</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print Discharge Sheet
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pharmacy;
