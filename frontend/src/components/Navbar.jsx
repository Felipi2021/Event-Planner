import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = ({ isLoggedIn, profileImage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    alert('You have been logged out.');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/CreateEvent">Create Event</Link></li>
        {isLoggedIn ? (
          <>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
            {profileImage && (
              <li className="profile-image-container">
                <img src={`http://localhost:5000/uploads/${profileImage}`} alt="Profile" className="profile-image" />
              </li>
            )}
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;