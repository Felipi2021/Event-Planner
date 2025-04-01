import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsLoggedIn(true);
      axios.get(`http://localhost:5001/api/users/${userId}`)
        .then(response => {
          setProfileImage(response.data.image);
        })
        .catch(error => {
          console.error('Error fetching profile image:', error);
        });
    }
  }, []);

  const handleLogin = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
  
    if (token && userId) {
      setIsLoggedIn(true);
  
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userId}`);
        setProfileImage(response.data.image); 
      } catch (error) {
        console.error('Error fetching profile image after login:', error);
      }
    }
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} profileImage={profileImage} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={isLoggedIn ? <Events /> : <Navigate to="/login" />} />
        <Route path="/CreateEvent" element={isLoggedIn ? <CreateEvent /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000} 
        hideProgressBar={false} 
        closeOnClick 
        pauseOnHover 
        draggable 
        closeButton={false} 
      />
    </Router>
  );
}

export default App;