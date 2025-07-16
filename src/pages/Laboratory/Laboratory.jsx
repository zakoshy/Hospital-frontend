import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TEST_TEMPLATES } from '../../utils/testTemplates';

const Laboratory = () => {
  const [patientData, setPatientData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [resultFields, setResultFields] = useState({});

  const fetchPendingReferrals = async () => {
    try {
      console.log("🚀 [fetchPendingReferrals] Called.");
      const res = await api.get(`/api/laboratory-referrals/pending`);
      console.log("✅ Raw referrals data fetched:", res.data);

      let referrals = Array.isArray(res.data) ? res.data : [];
      console.log(`🔎 Number of referrals fetched: ${referrals.length}`);

      setPatientData(referrals);

      if (referrals.length === 0) {
        console.log("⚠️ No pending referrals to display.");
      } else {
        console.log(`✅ ${referrals.length} referrals ready for display.`);
      }
    } catch (error) {
      console.error("❌ Error fetching referrals:", error);
      alert("No lab referrals found.");
    }
  };

  useEffect(() => {
    fetchPendingReferrals();
  }, []);

  const normalizeTestsRequested = (testsRequested) => {
    if (Array.isArray(testsRequested)) {
      return testsRequested.map(t => t.trim());
    } else if (typeof testsRequested === "string") {
      return testsRequested
        .split(",")
        .map(t => t.trim())
        .filter(t => t !== "");
    } else {
      return [];
    }
  };

  const handleSelectPatient = (patient) => {
    const tests = normalizeTestsRequested(patient.testsRequested);
    setSelectedPatient({ ...patient, testsRequested: tests });
    setPaymentConfirmed(patient.paymentStatus === 'paid');
    setResultFields({});
  };

  const handlePayment = async () => {
    try {
      const payload = {
        patientId: selectedPatient.patientId,
        department: selectedPatient.department,
      };

      await api.post(`/api/laboratory-referrals/payments`, payload);
      alert("Payment simulated.");
      await fetchPendingReferrals();
      setPaymentConfirmed(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed.");
    }
  };

  const buildStructuredResults = () => {
    const structured = {};
    Object.entries(resultFields).forEach(([key, value]) => {
      const [testName, fieldName] = key.split(".");
      if (!structured[testName]) {
        structured[testName] = {};
      }
      structured[testName][fieldName] = value;
    });
    return structured;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentConfirmed) {
      alert('Please confirm payment before proceeding.');
      return;
    }

    const structuredResults = buildStructuredResults();

    try {
      await api.post(`/api/laboratory-referrals/results`, {
        patientId: selectedPatient.patientId,
        department: selectedPatient.department,
        results: structuredResults,
      });

      alert('✅ Results sent to department doctor.');

      await fetchPendingReferrals();
      setSelectedPatient(null);
      setPaymentConfirmed(false);
      setResultFields({});
    } catch (error) {
      console.error('Failed to submit results:', error);
      alert('Failed to submit lab results.');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this lab referral?")) return;
    try {
      await api.delete(`/api/laboratory-referrals/${patientId}`);
      await fetchPendingReferrals();
      alert("Referral deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete referral.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Laboratory</h2>

      {!selectedPatient && (
        <>
          {patientData.length > 0 ? (
            <>
              <h5>Pending Lab Referrals</h5>
              <ul className="list-group">
                {patientData.map((patient) => (
                  <li
                    key={patient._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      {patient.name}
                    </span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePatient(patient._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-danger">No pending lab referrals found.</p>
          )}
        </>
      )}

      {selectedPatient && (
        <>
          <div className="card p-3 mb-4">
            <h5>Patient Info</h5>
            <p><strong>Name:</strong> {selectedPatient.name}</p>
            <p><strong>ID:</strong> {selectedPatient.idNumber || selectedPatient.id}</p>
            <p><strong>Department:</strong> {selectedPatient.department}</p>
            <p><strong>Requested Tests:</strong>{" "}
              {Array.isArray(selectedPatient.testsRequested)
                ? selectedPatient.testsRequested.join(", ")
                : selectedPatient.testsRequested || "None"}
            </p>
            <p><strong>Referred At:</strong> {new Date(selectedPatient.referralTime).toLocaleString()}</p>
            <p><strong>Payment Status:</strong>{" "}
              <span className={paymentConfirmed ? 'text-success' : 'text-warning'}>
                {paymentConfirmed ? 'paid' : 'pending'}
              </span>
            </p>
          </div>

          {!paymentConfirmed && (
            <>
              <p className="text-warning">
                Payment not yet confirmed.
              </p>
              <button
                className="btn btn-primary mb-3"
                onClick={handlePayment}
              >
                Confirm Payment
              </button>
            </>
          )}

          {paymentConfirmed &&
            Array.isArray(selectedPatient.testsRequested) &&
            selectedPatient.testsRequested.length > 0 && (
            <form onSubmit={handleSubmit}>
              {selectedPatient.testsRequested.map((testName) => {
                const template = TEST_TEMPLATES[testName?.trim()] || null;

                if (!template) {
                  return (
                    <p key={testName} className="text-danger">
                      Unknown test: {testName}
                    </p>
                  );
                }

                return (
                  <div key={testName} className="mb-4 border p-3 rounded">
                    <h5>{testName}</h5>
                    {template.map((item) => {
                      const fieldKey = `${testName}.${item.field}`;
                      return (
                        <div className="mb-3" key={fieldKey}>
                          <label className="form-label">
                            {item.field} {item.unit && `(${item.unit})`}
                          </label>
                          {item.type === "text" || item.type === "number" ? (
                            <input
                              type={item.type}
                              className="form-control"
                              value={resultFields[fieldKey] || ""}
                              onChange={(e) =>
                                setResultFields({
                                  ...resultFields,
                                  [fieldKey]: e.target.value,
                                })
                              }
                              required
                            />
                          ) : item.type === "select" ? (
                            <select
                              className="form-control"
                              value={resultFields[fieldKey] || ""}
                              onChange={(e) =>
                                setResultFields({
                                  ...resultFields,
                                  [fieldKey]: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">-- Select --</option>
                              {item.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <button className="btn btn-success w-100" type="submit">
                Submit Results to Department
              </button>
            </form>
          )}

          <button
            className="btn btn-secondary mt-3"
            onClick={() => setSelectedPatient(null)}
          >
            Back to Patient List
          </button>
        </>
      )}
    </div>
  );
};

export default Laboratory;
