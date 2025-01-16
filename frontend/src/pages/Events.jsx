import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import '../styles/form.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);

        const token = localStorage.getItem('token');
        if (token) {
          const userId = localStorage.getItem('userId');
          const attendanceResponse = await axios.get(`http://localhost:5000/api/users/${userId}/attendance`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAttendanceStatus(attendanceResponse.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to register for the event.');
        return;
      }

      const userId = localStorage.getItem('userId');
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: true }));
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, attendees_count: event.attendees_count + 1 } : event
        )
      );
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Failed to register for the event. Please try again.');
    }
  };

  const handleAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to mark attendance.');
        return;
      }

      const userId = localStorage.getItem('userId');
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/attend`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: true }));
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, attendees_count: event.attendees_count + 1 } : event
        )
      );
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleRemoveAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to remove attendance.');
        return;
      }

      const userId = localStorage.getItem('userId');
      const response = await axios.delete(
        `http://localhost:5000/api/events/${eventId}/attend`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId },
        }
      );
      alert(response.data.message);
      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: false }));
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, attendees_count: event.attendees_count - 1 } : event
        )
      );
    } catch (err) {
      console.error('Error removing attendance:', err);
      alert('Failed to remove attendance. Please try again.');
    }
  };

  return (
    <div className="event-list-container">
      <h2>Available Events</h2>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isAttending={attendanceStatus[event.id]}
          onRegister={handleRegister}
          onAttend={handleAttend}
          onRemoveAttend={handleRemoveAttend}
        />
      ))}
    </div>
  );
};

export default Events;