import React, { useState, useEffect } from 'react';

const EventCard = ({ event, isAttending: initialIsAttending, onRegister, onAttend, onRemoveAttend }) => {
  const [isAttending, setIsAttending] = useState(initialIsAttending);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAttending(initialIsAttending);
  }, [initialIsAttending]);

  const handleAttendClick = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
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
      const userId = localStorage.getItem('userId');
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
      const userId = localStorage.getItem('userId');
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
    <div style={styles.container}>
      <h3 style={styles.title}>{event.title}</h3>
      <p style={styles.description}>{event.description}</p>
      <p style={styles.detail}><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p style={styles.detail}><strong>Location:</strong> {event.location}</p>
      <p style={styles.detail}><strong>Capacity:</strong> {event.capacity}</p>
      <p style={styles.detail}><strong>Attendees:</strong> {event.attendees_count}</p>
      <div style={styles.buttonGroup}>
        {isAttending ? (
          <button style={{ ...styles.button, ...styles.attendingButton }} onClick={() => onRemoveAttend(event.id)}>Remove Attendance</button>
        ) : (
          <>
            <button style={{ ...styles.button, ...styles.attendButton }} onClick={() => onAttend(event.id)}>Attend</button>
            <button style={{ ...styles.button, ...styles.registerButton }} onClick={() => onRegister(event.id)}>Register</button>
          </>
        )}
      </div>
    </div>
  );
};


const styles = {
  container: {
    maxWidth: '350px',
    width: '700px',
    margin: '0 auto',
    padding: '2rem',
    border: '1px solid #171717',
    borderRadius: '8px',
    backgroundColor: 'rgba(68, 65, 65, 0.571)',
    boxShadow: '0 4px 8px rgba(65, 64, 64, 0.1)',
    marginBottom: '1.5rem',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#8b8484',
  },
  description: {
    marginBottom: '1.5rem',
    color: '#8b8484',
  },
  detail: {
    marginBottom: '0.5rem',
    color: '#8b8484',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    width: 'auto',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginRight: '8px',
  },
  attendButton: {
    backgroundColor: '#007bff',
    outline: 'none',
  },
  attendingButton: {
    backgroundColor: '#0056b3',
    outline: 'none',
  },
  registerButton: {
    backgroundColor: 'rgba(241, 161, 11, 0.85)',
    color: 'black',
    outline: 'none',
  },
};

export default EventCard;
