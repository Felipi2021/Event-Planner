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
      toast.error('Brak uprawnien');
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
      setError('Nie udalo sie wczytac uzytkownikow');
      toast.error('Nie udalo sie wczytac uzytkownikow');
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
      setError('Nie udalo sie wczytac wydarzen i komentarzy');
      toast.error('Nie udalo sie wczytac wydarzen i komentarzy');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error('Powod blokady jest wymagany');
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
      
      toast.success('Uzytkownik zostal zablokowany');
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('Nie udalo sie zablokowac uzytkownika');
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
      
      toast.success('Uzytkownik zostal odblokowany');
      fetchUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      toast.error('Nie udalo sie odblokowac uzytkownika');
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
      
      toast.success('Wydarzenie zostalo usuniete');
      fetchEventsAndComments(); 
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Nie udalo sie usunac wydarzenia');
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
      
      toast.success('Komentarz zostal usuniety');
      fetchEventsAndComments(); 
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Nie udalo sie usunac komentarza');
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

  if (loading) return <div className="admin-page">Ladowanie...</div>;
  if (error) return <div className="admin-page">Blad: {error}</div>;

  return (
    <div className="admin-page">
      <h1>Panel administratora</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Uzytkownicy
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''} 
          onClick={() => setActiveTab('events')}
        >
          Wydarzenia
        </button>
        <button 
          className={activeTab === 'comments' ? 'active' : ''} 
          onClick={() => setActiveTab('comments')}
        >
          Komentarze
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>Zarzadzanie uzytkownikami</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Nazwa uzytkownika</th>
                <th>Email</th>
                <th>Administrator</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.is_banned ? 'banned-row' : ''}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.is_admin ? 'Tak' : 'Nie'}</td>
                  <td>
                    {user.is_banned ? (
                      <span className="banned-badge" title={user.ban_reason}>
                        Zablokowany
                      </span>
                    ) : 'Aktywny'}
                  </td>
                  <td>
                    {user.is_banned ? (
                      <button 
                        onClick={() => handleUnbanUser(user.id)}
                        className="btn-unban"
                      >
                        Odblokuj
                      </button>
                    ) : (
                      <button 
                        onClick={() => openBanModal(user)}
                        className="btn-ban"
                        disabled={user.is_admin}
                      >
                        Zablokuj
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
          <h2>Zarzadzanie wydarzeniami</h2>
          <table className="events-table">
            <thead>
              <tr>
                <th>Tytul</th>
                <th>Utworzone przez</th>
                <th>Data</th>
                <th>Lokalizacja</th>
                <th>Akcje</th>
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
                      Usun
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
          <h2>Zarzadzanie komentarzami</h2>
          <table className="comments-table">
            <thead>
              <tr>
                <th>Wydarzenie</th>
                <th>Uzytkownik</th>
                <th>Komentarz</th>
                <th>Data</th>
                <th>Akcje</th>
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
                      Usun
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
            <h3>Zablokuj uzytkownika: {selectedUser.username}</h3>
            <label htmlFor="banReason">Powod blokady:</label>
            <textarea
              id="banReason"
              value={banReason}
              onChange={handleBanReasonChange}
              placeholder="Wpisz powod zablokowania tego uzytkownika"
              rows={4}
              required
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleBanUser} className="btn-ban">
                Zablokuj uzytkownika
              </button>
              <button onClick={closeModal} className="btn-cancel">
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content delete-confirm-modal">
            <h3>Potwierdz usuniecie</h3>
            <p>
              Czy na pewno chcesz usunac ten element ({deleteType})? 
              Tej operacji nie mozna cofnac.
            </p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-delete">
                Tak, usun
              </button>
              <button onClick={closeDeleteConfirmation} className="btn-cancel">
                Nie, anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 