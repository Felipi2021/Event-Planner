import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/EventCard.scss';

const EventCard = ({ event, isAttending: initialIsAttending, onAttend, onRemoveAttend }) => {
  const [isAttending, setIsAttending] = useState(initialIsAttending);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsAttending(initialIsAttending);
  }, [initialIsAttending]);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <button className="close-modal-button" onClick={handleCloseModal}>
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="event-card">
      <div className="event-card__image">
        {event.image && <img src={`http://localhost:5001/uploads/${event.image}`} alt={event.title} />}
      </div>
      <div className="event-card__content">
        <h3>{event.title}</h3>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Capacity:</strong> {event.capacity}</p>
        <p><strong>Attendees:</strong> {event.attendees_count}</p>
        <p><strong>Created By:</strong> {event.created_by_username || 'Unknown'}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <div className="buttonGroup">
          {isAttending ? (
            <button onClick={() => onRemoveAttend(event.id)}>Remove Attendance</button>
          ) : (
            <button onClick={() => onAttend(event.id)}>Attend</button>
          )}
          <button className="register-button" onClick={handleShowModal}>
            Show Description
          </button>
        </div>
      </div>
      {showModal && ReactDOM.createPortal(modalContent, document.body)}
    </div>
  );
};

export default EventCard;