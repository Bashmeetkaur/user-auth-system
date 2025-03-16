import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import authService from '../services/authService';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await authService.login(email, password);
      login(token);
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setError(error.response?.data?.msg || 'Login failed');
      }
  };
};
  return (
    <div className="container-login">
      <h2 className="head">Login</h2>
      <form onSubmit={handleSubmit}>
      {error && <div className="alert-danger">{error}</div>}
      {errors.length > 0 && (
          <ul className="error-message">
            {errors.map((err, idx) => <li key={idx}>{err.msg}</li>)}
          </ul>
        )}
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
        <div className="feilds">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Login</button>
        
      </form>
      <p className="register">
        Don't have an account? <a href="/register">Register
        </a>
        Forgot password? <a href="/reset-password-request">Reset it</a>
      </p>
    </div>
  );
};

export default Login;