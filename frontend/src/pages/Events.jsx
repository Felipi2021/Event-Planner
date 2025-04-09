import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventCard from '../components/EventCard';
import '../styles/global.scss';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/events');
        setEvents(response.data);
  
        const token = localStorage.getItem('token');
        if (token) {
          const userId = localStorage.getItem('userId');
          const attendanceResponse = await axios.get(`http://localhost:5001/api/users/${userId}/attendance`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAttendanceStatus(attendanceResponse.data);
        } else {
          setAttendanceStatus({}); 
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        toast.error('Failed to fetch events. Please try again.');
      }
    };
  
    fetchEvents();
  }, []);

  const handleAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to log in to mark attendance.');
        return;
      }
  
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User ID is missing. Please log in again.');
        return;
      }
  
      const response = await axios.post(
        `http://localhost:5001/api/events/${eventId}/attend`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      toast.success(response.data.message);
  
      // Update attendanceStatus
      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: true }));
  
      // Update events list
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees_count: event.attendees_count + 1 }
            : event
        )
      );
    } catch (err) {
      console.error('Error marking attendance:', err);
      toast.error('Failed to mark attendance. Please try again.');
    }
  };

  const handleRemoveAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to log in to remove attendance.');
        return;
      }
  
      const userId = localStorage.getItem('userId');
      const response = await axios.delete(
        `http://localhost:5001/api/events/${eventId}/attend`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId },
        }
      );
  
      toast.success(response.data.message);
      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: false }));

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees_count: Math.max(event.attendees_count - 1, 0) }
            : event
        )
      );
    } catch (err) {
      console.error('Error removing attendance:', err);
      toast.error('Failed to remove attendance. Please try again.');
    }
  };

return (
  <div className="page-container">
    <h2>Available Events</h2>
    {events.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        isAttending={attendanceStatus[event.id]}
        onAttend={handleAttend}
        onRemoveAttend={handleRemoveAttend}
      />
    ))}
  </div>
);
};

export default Events;