import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/form.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordValid, setPasswordValid] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [emailMessage, setEmailMessage] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const errors = [];
    if (value.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least 1 uppercase letter.');
    }
    if (!/\d/.test(value)) {
      errors.push('Password must contain at least 1 number.');
    }
    if (!/[@$!%*#^?&]/.test(value)) {
      errors.push('Password must contain at least 1 special character.');
    }

    if (errors.length === 0) {
      setPasswordValid(true);
    } else {
      setPasswordValid(false);
    }
    setPasswordErrors(errors);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      setEmailValid(true);
      setEmailMessage('');
    } else {
      setEmailValid(false);
      setEmailMessage('Invalid email format');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordErrors.length > 0 || !emailValid) {
      alert('Please fix the errors before submitting.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', { username, email, password });
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Register</h2>
      <div className="form__group">
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="form__group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={!emailValid ? 'invalid' : ''}
          required
        />
        {!emailValid && <p className="error-message">{emailMessage}</p>}
      </div>
      <div className="form__group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          className={passwordErrors.length > 0 ? 'invalid' : ''}
          required
        />
        {passwordErrors.length > 0 ? (
          passwordErrors.map((error, index) => (
            <p key={index} className="error-message">{error}</p>
          ))
        ) : (
          <p className="success-message">Password is valid ✓</p>
        )}
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;