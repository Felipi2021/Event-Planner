import React, { useState } from 'react';

const EventCard = ({ event, onRegister, onAttend, onRemoveAttend }) => {
  const [isAttending, setIsAttending] = useState(false);

  const handleAttendClick = async () => {
    await onAttend(event.id); 
    setIsAttending(true); 
  };

  const handleRemoveAttendClick = async () => {
    await onRemoveAttend(event.id); 
    setIsAttending(false); 
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
        >
          Attending (Click to Remove)
        </button>
      ) : (
        <button
          style={styles.attendButton}
          onClick={handleAttendClick}
        >
          Mark as Attending
        </button>
      )}
      <button style={styles.registerButton} onClick={() => onRegister(event.id)}>
        Register
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
    cursor: 'default', 
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
