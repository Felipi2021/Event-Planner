import React, { useState } from 'react';

const EventCard = ({ event, onRegister, onAttend, onRemoveAttend }) => {
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAttendClick = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId'); // Ensure userId is stored in localStorage
      if (!userId) {
        alert('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      await onAttend(event.id, userId); 
      setIsAttending(true); 
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttendClick = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId'); // Ensure userId is stored in localStorage
      if (!userId) {
        alert('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      await onRemoveAttend(event.id, userId); 
      setIsAttending(false); 
    } catch (error) {
      console.error('Error removing attendance:', error);
      alert('Failed to remove attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId'); // Ensure userId is stored in localStorage
      if (!userId) {
        alert('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      await onRegister(event.id, userId);
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for the event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{event.title}</h3>
      <p style={styles.description}>{event.description}</p>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Capacity:</strong> {event.capacity}</p>
      <p><strong>Attendees:</strong> {event.attendees_count}</p>
      {isAttending ? (
        <button
          style={styles.attendingButton}
          onClick={handleRemoveAttendClick}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Attending (Click to Remove)'}
        </button>
      ) : (
        <button
          style={styles.attendButton}
          onClick={handleAttendClick}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Mark as Attending'}
        </button>
      )}
      <button style={styles.registerButton} onClick={handleRegisterClick} disabled={loading}>
        {loading ? 'Processing...' : 'Register'}
      </button>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    width: '700px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  description: {
    fontSize: '1rem',
    marginBottom: '8px',
  },
  attendButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  attendingButton: {
    padding: '8px 16px',
    backgroundColor: '#646cff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  registerButton: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default EventCard;
