import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Navbar from './components/Navbar';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsLoggedIn(true);
      // Fetch the user's profile image
      axios.get(`http://localhost:5000/api/users/${userId}`)
        .then(response => {
          setProfileImage(response.data.image);
        })
        .catch(error => {
          console.error('Error fetching profile image:', error);
        });
    }
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} profileImage={profileImage} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={isLoggedIn ? <Events /> : <Navigate to="/login" />} />
        <Route path="/CreateEvent" element={isLoggedIn ? <CreateEvent /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;