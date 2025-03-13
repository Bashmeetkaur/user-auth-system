// client/src/components/ResetPasswordRequest.jsx
import React, { useState } from 'react';
import authService from '../services/authService';

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.requestPasswordReset(email);
      setMessage(data.msg);
    } catch (error) {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setMessage(error.response?.data?.msg || 'Password Reset Request failed');
        }

  };
};

  return (
    <div className="container mt-5">
      <div className="custom-container">
        <h2>Reset Password</h2>
        {message && <div className="alert alert-info">{message}</div>}
        {errors.length > 0 && (
          <ul className="error-message">
            {errors.map((err, idx) => <li key={idx}>{err.msg}</li>)}
          </ul>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;