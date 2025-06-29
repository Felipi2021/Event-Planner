import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/navbar.scss';
import axios from 'axios';

const Navbar = ({ isLoggedIn, profileImage, isAdmin, onLogout, pendingCount }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
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

  const handleBellClick = async (e) => {
    e.stopPropagation();
    setBellOpen((open) => !open);
    if (!bellOpen) {
      setLoadingNotifications(true);
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/groups/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(Array.isArray(res.data) ? res.data : []);
        await axios.post('/api/groups/notifications/seen', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        setNotifications([]);
      }
      setLoadingNotifications(false);
    }
  };

  React.useEffect(() => {
    if (bellOpen) {
      const close = () => setBellOpen(false);
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [bellOpen]);

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
        {isLoggedIn && (
          <li>
            <Link to="/groups" className="navbar-button" onClick={handleLinkClick}>Groups</Link>
          </li>
        )}
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
              <li className="profile-image-container" onClick={handleProfileClick} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <span className="navbar-bell" title="Group Join Requests" onClick={handleBellClick} style={{ position: 'relative' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 17Zm-2 .01V11c0-2.48-1.51-4.5-4-4.5S8 8.52 8 11v6h8v-1.99Z" fill="currentColor"/></svg>
                  {pendingCount > 0 && <span className="bell-badge">{pendingCount}</span>}
                  {bellOpen && (
                    <div className="bell-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="bell-dropdown-header">Notifications</div>
                      {loadingNotifications ? (
                        <div className="bell-dropdown-item">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="bell-dropdown-item">No new notifications</div>
                      ) : notifications.map((n, idx) => (
                        <div key={n.id || idx} className="bell-dropdown-item">
                          {n.type === 'event' && n.message ? (
                            <span>{n.message}</span>
                          ) : n.status === 'joined' ? (
                            <span>You were <b>accepted</b> to <b>{n.group_name}</b></span>
                          ) : (
                            <span>You were <b>rejected</b> from <b>{n.group_name}</b></span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </span>
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