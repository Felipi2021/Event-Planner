import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/form.scss';

const Login = ({ onLogin }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [emailMessage, setEmailMessage] = useState('');
  const navigate = useNavigate();

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
    if (!emailValid) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5001/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      toast.success('Logged in successfully!');
      onLogin(); 
      navigate('/events');
    } catch (err) {
      toast.error('Login failed. Check your credentials.');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Login</h2>
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
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;