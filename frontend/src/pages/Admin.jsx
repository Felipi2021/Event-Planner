import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/admin.scss';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/');
      toast.error('Unauthorized access');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5001/api/users/admin/all-users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error('Ban reason is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5001/api/users/admin/ban', 
        { userId: selectedUser.id, banReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('User banned successfully');
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5001/api/users/admin/unban', 
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('User unbanned successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      toast.error('Failed to unban user');
    }
  };

  const openBanModal = useCallback((user) => {
    setSelectedUser(user);
    setBanReason('');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedUser(null);
    setBanReason('');
  }, []);

  const handleBanReasonChange = useCallback((e) => {
    setBanReason(e.target.value);
  }, []);

  if (loading) return <div className="admin-page">Loading...</div>;
  if (error) return <div className="admin-page">Error: {error}</div>;

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <h2>User Management</h2>
      
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={user.is_banned ? 'banned-row' : ''}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_admin ? 'Yes' : 'No'}</td>
              <td>
                {user.is_banned ? (
                  <span className="banned-badge" title={user.ban_reason}>
                    Banned
                  </span>
                ) : 'Active'}
              </td>
              <td>
                {user.is_banned ? (
                  <button 
                    onClick={() => handleUnbanUser(user.id)}
                    className="btn-unban"
                  >
                    Unban
                  </button>
                ) : (
                  <button 
                    onClick={() => openBanModal(user)}
                    className="btn-ban"
                    disabled={user.is_admin}
                  >
                    Ban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ban Modal */}
      {showModal && selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Ban User: {selectedUser.username}</h3>
            <label htmlFor="banReason">Reason for ban:</label>
            <textarea
              id="banReason"
              value={banReason}
              onChange={handleBanReasonChange}
              placeholder="Enter reason for banning this user"
              rows={4}
              required
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleBanUser} className="btn-ban">
                Ban User
              </button>
              <button onClick={closeModal} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 