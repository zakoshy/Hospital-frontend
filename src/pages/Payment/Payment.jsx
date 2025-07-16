import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../utils/api';

const Payment = () => {
  const [paymentData, setPaymentData] = useState({
    patientName: '',
    paymentType: '',
    amount: '',
    receiptNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/payments`, paymentData);
      setSuccess('Payment recorded successfully!');
      console.log('Backend Response:', res.data);

      // Reset form
      setPaymentData({
        patientName: '',
        paymentType: '',
        amount: '',
        receiptNumber: '',
      });
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Payment Desk</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="row justify-content-center">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              className="form-control"
              name="patientName"
              value={paymentData.patientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Payment Type</label>
            <select
              className="form-select"
              name="paymentType"
              value={paymentData.paymentType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="card">New Patient Card</option>
              <option value="lab">Lab Test</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Amount (KES)</label>
            <input
              type="number"
              className="form-control"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Receipt Number (Optional)</label>
            <input
              type="text"
              className="form-control"
              name="receiptNumber"
              value={paymentData.receiptNumber}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Processing...' : 'Pay & Proceed'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Payment;
