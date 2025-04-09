import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/form.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [emailMessage, setEmailMessage] = useState('');
  const [image, setImage] = useState(null);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(true);

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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordErrors.length > 0 || !emailValid) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5001/api/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Registered successfully!');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setServerError('Registration failed. Please try again.');
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-page">
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
        {passwordTouched && (
          passwordErrors.length > 0 ? (
            passwordErrors.map((error, index) => (
              <p key={index} className="error-message">{error}</p>
            ))
          ) : (
            <p className="success-message">Password is valid ✓</p>
          )
        )}
      </div>
      <div className="form__group">
        <label>Profile Image:</label>
        <input type="file" onChange={handleImageChange} />
      </div>
      {serverError && <p className="error-message">{serverError}</p>}
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;