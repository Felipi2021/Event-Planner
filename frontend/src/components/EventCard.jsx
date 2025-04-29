import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.scss';

const EventCard = ({ event, isAttending: initialIsAttending, onAttend, onRemoveAttend }) => {
  const [isAttending, setIsAttending] = useState(initialIsAttending);
  const [attendeesCount, setAttendeesCount] = useState(event.attendees_count);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAttending(initialIsAttending);
  }, [initialIsAttending]);

  const handleAttendClick = (e) => {
    e.stopPropagation(); 
    if (isAttending) {
      onRemoveAttend(event.id);
      setIsAttending(false);
      setAttendeesCount((prev) => Math.max(prev - 1, 0));
    } else {
      onAttend(event.id);
      setIsAttending(true);
      setAttendeesCount((prev) => prev + 1);
    }
  };

  const handleNavigateToDetails = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="event-card" onClick={handleNavigateToDetails} style={{ cursor: 'pointer' }}>
      <div className="event-card__image">
        {event.image && <img src={`http://localhost:5001/uploads/${event.image}`} alt={event.title} />}
      </div>
      <div className="event-card__content">
        <h3>{event.title}</h3>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Capacity:</strong> {event.capacity}</p>
        <p><strong>Attendees:</strong> {attendeesCount}</p>
        <p><strong>Created By:</strong> {event.created_by_username || 'Unknown'}</p>
        <div className="buttonGroup">
          <button onClick={handleAttendClick}>
            {isAttending ? 'Remove Attendance' : 'Attend'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;