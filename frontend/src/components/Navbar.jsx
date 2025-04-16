import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ isLoggedIn, profileImage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success('You have been logged out successfully!');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/" className="navbar-button">Home</Link>
        </li>
        <li>
          <Link to="/events" className="navbar-button">Events</Link>
        </li>
        <li>
          <Link to="/CreateEvent" className="navbar-button">Create Event</Link>
        </li>
        {isLoggedIn ? (
          <>
            <li>
              <button className="navbar-button" onClick={handleLogout}>Logout</button>
            </li>
            {profileImage && (
              <li className="profile-image-container" onClick={() => navigate('/profile')}>
                <img src={`http://localhost:5001/uploads/${profileImage}`} alt="Profile" className="profile-image" />
              </li>
            )}
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="navbar-button">Login</Link>
            </li>
            <li>
              <Link to="/register" className="navbar-button">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;