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
        <li><button><Link to="/">Home</Link></button></li>
        <li><button><Link to="/events">Events</Link></button></li>
        <li><button><Link to="/CreateEvent">Create Event</Link></button></li>
        {isLoggedIn ? (
          <>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
            {profileImage && (
              <li className="profile-image-container" onClick={() => navigate('/profile')}>
                <img src={`http://localhost:5001/uploads/${profileImage}`} alt="Profile" className="profile-image" />
              </li>
            )}
          </>
        ) : (
          <>
            <li><button><Link to="/login">Login</Link></button></li>
            <li><button><Link to="/register">Register</Link></button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;