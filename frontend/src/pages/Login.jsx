import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/form.scss';

const Login = ({ onLogin }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [emailMessage, setEmailMessage] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
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
      setEmailMessage('Nieprawidlowy format e-mail');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailValid) {
        toast.error('Popraw bledy przed wyslaniem formularza.');
        return;
    }
    try {
        const response = await axios.post('http://localhost:5001/api/users/login', { email, password });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('isAdmin', response.data.isAdmin ? 'true' : 'false');

        const userDetails = await axios.get(`http://localhost:5001/api/users/${response.data.userId}`);
        localStorage.setItem('profileImage', userDetails.data.image || 'default-avatar.png');

        toast.success('Zalogowano pomyslnie!');
        onLogin();
        
        if (response.data.isAdmin) {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } catch (err) {
        console.error('Login error:', err);
        
        if (err.response && err.response.data && err.response.data.isBanned) {
            setIsBanned(true);
            setBanReason(err.response.data.banReason || 'Brak podanego powodu');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('isAdmin');
        } else {
            toast.error('Logowanie nie powiodlo sie. Sprawdz dane logowania.');
        }
    }
};

  if (isBanned) {
    return (
      <div className="banned-page">
        <div className="banned-user">
          <h2>Konto zablokowane</h2>
          <p>Twoje konto w Event Planner zostalo zablokowane za:</p>
          <p className="ban-reason">{banReason}</p>
          <p>Jesli to pomylka, skontaktuj sie z pomoca techniczna.</p>
          <div className="banned-actions">
            <Link to="/" className="back-to-home">
              Wroc na strone glowna
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-page">
      <h2>Logowanie</h2>
      <div className="form__group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={!emailValid ? 'invalid' : ''}
          required
        />
        {!emailValid && <p className="error-message">{emailMessage}</p>}
      </div>
      <div className="form__group">
        <label htmlFor="password">Haslo:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Zaloguj</button>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Nie masz konta?{' '}
        <Link to="/register" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Zarejestruj sie
        </Link>
      </p>
    </form>
  );
};

export default Login;