import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/admin.scss';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/');
      toast.error('Unauthorized access');
    } else {
      fetchUsers();
      fetchEventsAndComments();
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

  const fetchEventsAndComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5001/api/events/admin/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setEvents(response.data.events);
      setComments(response.data.comments);
      setError(null);
    } catch (err) {
      console.error('Error fetching events and comments:', err);
      setError('Failed to load events and comments');
      toast.error('Failed to load events and comments');
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

  const openDeleteConfirmation = (type, id, eventId = null) => {
    setDeleteType(type);
    setDeleteItemId(id);
    setDeleteEventId(eventId);
    setShowDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteModal(false);
    setDeleteType('');
    setDeleteItemId(null);
    setDeleteEventId(null);
  };

  const confirmDelete = async () => {
    if (deleteType === 'event') {
      await handleDeleteEvent(deleteItemId);
    } else if (deleteType === 'comment') {
      await handleDeleteComment(deleteEventId, deleteItemId);
    }
    closeDeleteConfirmation();
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5001/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Event deleted successfully');
      fetchEventsAndComments(); 
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteComment = async (eventId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5001/api/events/${eventId}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Comment deleted successfully');
      fetchEventsAndComments(); 
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
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

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="admin-page">Loading...</div>;
  if (error) return <div className="admin-page">Error: {error}</div>;

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''} 
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button 
          className={activeTab === 'comments' ? 'active' : ''} 
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="tab-content">
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
        </div>
      )}

      {activeTab === 'events' && (
        <div className="tab-content">
          <h2>Events Management</h2>
          <table className="events-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Created By</th>
                <th>Date</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>
                    <a href={`/events/${event.id}`} target="_blank" rel="noopener noreferrer">
                      {event.title}
                    </a>
                  </td>
                  <td>{event.created_by_username}</td>
                  <td>{formatDate(event.date)}</td>
                  <td>{event.location}</td>
                  <td>
                    <button 
                      onClick={() => openDeleteConfirmation('event', event.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="tab-content">
          <h2>Comments Management</h2>
          <table className="comments-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>User</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td>
                    <a href={`/events/${comment.event_id}`} target="_blank" rel="noopener noreferrer">
                      {comment.event_title}
                    </a>
                  </td>
                  <td>{comment.username}</td>
                  <td>{comment.text}</td>
                  <td>{formatDate(comment.created_at)}</td>
                  <td>
                    <button 
                      onClick={() => openDeleteConfirmation('comment', comment.id, comment.event_id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content delete-confirm-modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete this {deleteType}? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-delete">
                Yes, Delete
              </button>
              <button onClick={closeDeleteConfirmation} className="btn-cancel">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 