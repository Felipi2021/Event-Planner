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
        toast.error('Musisz sie zalogowac.');
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
      toast.error('Nie udalo sie pobrac wydarzen.');
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
        toast.error('Musisz sie zalogowac, aby dolaczyc do wydarzenia.');
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
      toast.success('Dolaczyles do tego wydarzenia.');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Nie udalo sie zapisac udzialu.');
    }
  };

  const handleRemoveAttend = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('Musisz sie zalogowac, aby zrezygnowac z udzialu.');
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
      toast.info('Zrezygnowales z udzialu w tym wydarzeniu.');
    } catch (err) {
      console.error('Error removing attendance:', err);
      toast.error('Nie udalo sie zrezygnowac z udzialu.');
    }
  };

  return (
    <div className="page-container">
      <h2>Dostepne wydarzenia</h2>
      <div className="controls-container">
        <div className="sort-controls">
          <label>Sortuj wedlug:</label>
          <select
            onChange={(e) => handleSort(e.target.value, sortOrder)}
            value={sortCriteria}
          >
            <option value="name">Nazwa</option>
            <option value="date">Data wydarzenia</option>
            <option value="capacity">Liczba miejsc</option>
          </select>
          <label>Kolejnosc:</label>
          <select
            onChange={(e) => handleSort(sortCriteria, e.target.value)}
            value={sortOrder}
          >
            <option value="asc">Rosnaco</option>
            <option value="desc">Malejaco</option>
          </select>
        </div>
        <div className="search-controls">
          <label>Szukaj:</label>
          <input
            type="text"
            placeholder="Szukaj wydarzen po tytule"
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