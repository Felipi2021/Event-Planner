import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventCard from '../components/EventCard';
import '../styles/events.scss';

const Events = ({ events }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to log in.');
        return;
      }

      const response = await axios.get('http://localhost:5001/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllEvents(response.data);
      setFilteredEvents(response.data);

      const userId = localStorage.getItem('userId');
      if (userId) {
        const attendanceResponse = await axios.get(
          `http://localhost:5001/api/users/${userId}/attendance`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendanceStatus(attendanceResponse.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events.');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSort = (criteria, order) => {
    setSortCriteria(criteria);
    setSortOrder(order);

    const sortedEvents = [...filteredEvents];
    if (criteria === 'name') {
      sortedEvents.sort((a, b) =>
        order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      );
    } else if (criteria === 'date') {
      sortedEvents.sort((a, b) =>
        order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
      );
    } else if (criteria === 'capacity') {
      sortedEvents.sort((a, b) =>
        order === 'asc' ? a.capacity - b.capacity : b.capacity - a.capacity
      );
    }
    setFilteredEvents(sortedEvents);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = allEvents.filter((event) =>
      event.title.toLowerCase().includes(query)
    );
    setFilteredEvents(filtered);
  };

  const handleAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('You need to log in to mark attendance.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5001/api/events/${eventId}/attend`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: true }));
      setFilteredEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees_count: (event.attendees_count || 0) + 1 }
            : event
        )
      );
      setAllEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees_count: (event.attendees_count || 0) + 1 }
            : event
        )
      );
      toast.success('You are now attending this event.');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance.');
    }
  };

  const handleRemoveAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('You need to log in to remove attendance.');
        return;
      }

      await axios.delete(`http://localhost:5001/api/events/${eventId}/attend`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      });

      setAttendanceStatus((prevStatus) => ({ ...prevStatus, [eventId]: false }));
      setFilteredEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees_count: Math.max((event.attendees_count || 0) - 1, 0) }
            : event
        )
      );
      setAllEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees_count: Math.max((event.attendees_count || 0) - 1, 0) }
            : event
        )
      );
      toast.info('You are no longer attending this event.');
    } catch (err) {
      console.error('Error removing attendance:', err);
      toast.error('Failed to remove attendance.');
    }
  };

  return (
    <div className="page-container">
      <h2>Available Events</h2>
      <div className="controls-container">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select
            onChange={(e) => handleSort(e.target.value, sortOrder)}
            value={sortCriteria}
          >
            <option value="name">Name</option>
            <option value="date">Date of Event</option>
            <option value="capacity">Capacity</option>
          </select>
          <label>Order:</label>
          <select
            onChange={(e) => handleSort(sortCriteria, e.target.value)}
            value={sortOrder}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="search-controls">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search events by title"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      {filteredEvents.map((event) => (
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