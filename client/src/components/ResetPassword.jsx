// // client/src/components/ResetPassword.jsx
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import authService from '../services/authService';

// const ResetPassword = () => {
//   const { token } = useParams();
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();
//   const [errors, setErrors] = useState([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await authService.resetPassword(token, password);
//       setMessage(data.msg);
//       setTimeout(() => navigate('/login'), 2000); // Redirect after 2s
//     } catch (error) {
//         if (error.response?.data?.errors) {
//           setErrors(error.response.data.errors);
//         } else {
//           setMessage(error.response?.data?.msg ||'Resetting failed');
//         }
//       }
//   };

//   return (
//     <div className="container mt-5">
//       <div className="custom-container">
//         <h2>Set New Password</h2>
//         {message && <div className="alert alert-info">{message}</div>}
//         {errors.length > 0 && (
//           <ul className="error-message">
//             {errors.map((err, idx) => <li key={idx}>{err.msg}</li>)}
//           </ul>
//         )}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label>New Password</label>
//             <input
//               type="password"
//               className="form-input"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="form-button">Reset Password</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting reset with token:', token, 'and password:', password); // Debug
    try {
      const data = await authService.resetPassword(token, password);
      setMessage(data.msg);
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2s
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Reset failed';
      const errorDetail = error.response?.data?.error || '';
      setMessage(`${errorMsg}${errorDetail ? `: ${errorDetail}` : ''}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="custom-container">
        <h2>Set New Password</h2>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;