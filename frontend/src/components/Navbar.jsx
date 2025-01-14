import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert('You have been logged out.');
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', background: '#333', color: '#fff' }}>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0 }}>
        <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
        <li><Link to="/events" style={{ color: 'white', textDecoration: 'none' }}>Events</Link></li>
        <li><Link to="/CreateEvent" style={{ color: 'white', textDecoration: 'none' }}>Create Event</Link></li>
        {isLoggedIn ? (
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </li>
        ) : (
          <>
            <li><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
            <li><Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

