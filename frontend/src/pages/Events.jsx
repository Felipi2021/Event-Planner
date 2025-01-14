import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
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
        alert('You need to log in to register for an event.');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Successfully registered for the event!');
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Failed to register. Please try again.');
    }
  };

  const handleAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to mark attendance.');
        return;
      }
  
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/attend`,
        {}, // Nie musisz przesyłać `userId`, jest w tokenie
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
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
  
      const response = await axios.delete(
        `http://localhost:5000/api/events/${eventId}/attend`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
    } catch (err) {
      console.error('Error removing attendance:', err);
      alert('Failed to remove attendance. Please try again.');
    }
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Available Events</h2>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onRegister={handleRegister}
          onAttend={handleAttend}
          onRemoveAttend={handleRemoveAttend}
        />
      ))}
    </div>
  );
};

export default Events;
