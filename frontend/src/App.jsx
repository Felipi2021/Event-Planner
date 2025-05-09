import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import ErrorBoundary from './components/ErrorBoundary';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails'; 
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fetchProfileImage = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userId}`);
        setProfileImage(response.data.image);
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    }
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    
    if (token && userId) {
      setIsLoggedIn(true);
      setIsAdmin(adminStatus);
      fetchProfileImage();
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    fetchProfileImage(); 
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setProfileImage(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('profileImage');
  };

  return (
    <Router>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        profileImage={profileImage} 
        isAdmin={isAdmin} 
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={isLoggedIn ? <Events /> : <Navigate to="/login" />} />
        <Route path="/events/:id" element={isLoggedIn ? <EventDetails /> : <Navigate to="/login" />} /> 
        <Route path="/CreateEvent" element={isLoggedIn ? <CreateEvent /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isLoggedIn && isAdmin ? <Admin /> : <Navigate to="/" />} />
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