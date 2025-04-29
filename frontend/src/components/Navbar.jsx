import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/navbar.scss';

const Navbar = ({ isLoggedIn, profileImage, isAdmin, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('isAdmin');
    }
    
    toast.success('You have been logged out successfully!');
    navigate('/login');
    setMenuOpen(false); 
  };

  const handleProfileClick = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      navigate(`/profile/${userId}`);
      setMenuOpen(false); 
    } else {
      toast.error('Failed to load profile data.');
    }
  };

  const handleLinkClick = () => {
    setMenuOpen(false); 
  };

  return (
    <nav className={`navbar ${menuOpen ? 'active' : ''}`}>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul>
        <li>
          <Link to="/" className="navbar-button" onClick={handleLinkClick}>Home</Link>
        </li>
        <li>
          <Link to="/events" className="navbar-button" onClick={handleLinkClick}>Events</Link>
        </li>
        <li>
          <Link to="/CreateEvent" className="navbar-button" onClick={handleLinkClick}>Create Event</Link>
        </li>
        {isLoggedIn ? (
          <>
            {isAdmin && (
              <li>
                <Link to="/admin" className="navbar-button admin-link" onClick={handleLinkClick}>
                  Admin Panel
                </Link>
              </li>
            )}
            <li>
              <button className="navbar-button" onClick={handleLogout}>Logout</button>
            </li>
            {profileImage && (
              <li className="profile-image-container" onClick={handleProfileClick}>
                <img
                  src={`http://localhost:5001/uploads/${profileImage}`}
                  alt="Profile"
                  className="profile-image"
                />
              </li>
            )}
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="navbar-button" onClick={handleLinkClick}>Login</Link>
            </li>
            <li>
              <Link to="/register" className="navbar-button" onClick={handleLinkClick}>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;