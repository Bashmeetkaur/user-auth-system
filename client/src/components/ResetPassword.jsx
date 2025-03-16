import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/resetpassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // New state to track success
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting reset with token:', token, 'and password:', password); // Debug
    try {
      const data = await authService.resetPassword(token, password);
      setMessage(data.msg);
      setIsSuccess(true); // Set success state
      setTimeout(() => navigate('/login'), 4000); // Increased to 4s for visibility
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Reset failed';
      const errorDetail = error.response?.data?.error || '';
      setMessage(`${errorMsg}${errorDetail ? `: ${errorDetail}` : ''}`);
      setIsSuccess(false); // Set error state
    }
  };

  return (
    <div className="container-resetpassword">
      <h2 className="head">Set New Password</h2>
      {message && (
        <div className={isSuccess ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="feilds">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;