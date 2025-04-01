import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/global.scss';

const EventCard = ({ event, isAttending: initialIsAttending, onAttend, onRemoveAttend }) => {
  const [isAttending, setIsAttending] = useState(initialIsAttending);
  const [loading, setLoading] = useState(false);
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
      <h3>{event.title}</h3>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Capacity:</strong> {event.capacity}</p>
      <p><strong>Attendees:</strong> {event.attendees_count}</p>
      <div className="buttonGroup">
        {isAttending ? (
          <button className="attending-button" onClick={() => onRemoveAttend(event.id)} disabled={loading}>
            Remove Attendance
          </button>
        ) : (
          <button className="attend-button" onClick={() => onAttend(event.id)} disabled={loading}>
            Attend
          </button>
        )}
        <button className="register-button" onClick={handleShowModal}>
          Show Description
        </button>
      </div>

      {showModal && ReactDOM.createPortal(modalContent, document.body)}
    </div>
  );
};

export default EventCard;