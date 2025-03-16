// client/src/components/ResetPasswordRequest.jsx
import React, { useState } from 'react';
import authService from '../services/authService';
import '../styles/resetpass.css';

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
      <div className="container-resetpassreq">
        <h2 className='head'>Reset Password</h2>
        {message && <div className="alert-sent">{message}</div>}
        {errors.length > 0 && (
          <ul className="error-message">
            {errors.map((err, idx) => <li key={idx}>{err.msg}</li>)}
          </ul>
        )}
        <form onSubmit={handleSubmit}>
          <div className="feilds">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Send Reset Link</button>
        </form>
      </div>
  );
};

export default ResetPasswordRequest;