import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
      errors.push('Haslo musi miec co najmniej 8 znakow.');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('Haslo musi zawierac co najmniej 1 duza litere.');
    }
    if (!/\d/.test(value)) {
      errors.push('Haslo musi zawierac co najmniej 1 cyfre.');
    }
    if (!/[@$!%*#^?&]/.test(value)) {
      errors.push('Haslo musi zawierac co najmniej 1 znak specjalny.');
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
      setEmailMessage('Nieprawidlowy format e-mail');
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordErrors.length > 0 || !emailValid) {
      toast.error('Popraw bledy przed wyslaniem formularza.');
      return;
    }

    if (!image) {
      toast.error('Zdjecie profilowe jest wymagane.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5001/api/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Rejestracja zakonczona pomyslnie!');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setServerError('Rejestracja nie powiodla sie. Sprobuj ponownie.');
        toast.error('Rejestracja nie powiodla sie. Sprobuj ponownie.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-page">
      <h2>Rejestracja</h2>
      <div className="form__group">
        <label htmlFor="username">Nazwa uzytkownika:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
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
            <p className="success-message">Haslo jest poprawne ✓</p>
          )
        )}
      </div>
      <div className="form__group">
        <label htmlFor="profileImage">Zdjecie profilowe:</label>
        <input
          id="profileImage"
          type="file"
          onChange={handleImageChange}
          required
        />
      </div>
      {serverError && <p className="error-message">{serverError}</p>}
      <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Masz juz konto?{' '}
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Zaloguj sie
        </Link>
      </p>
      <button type="submit">Zarejestruj sie</button>
    </form>
  );
};

export default Register;