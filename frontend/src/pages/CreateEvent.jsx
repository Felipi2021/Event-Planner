import React, { useState } from 'react';
import axios from 'axios';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to create an event.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/events',
        { title, description, date, location, capacity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Event created successfully!');
    } catch (err) {
      alert('Failed to create event. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
      <h2>Create Event</h2>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <label>Location:</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div>
        <label>Capacity:</label>
        <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
      </div>
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
