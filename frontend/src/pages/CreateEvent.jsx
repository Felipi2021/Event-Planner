import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CreateEvent.scss';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to log in to create an event.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('capacity', capacity);
      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:5001/api/events', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Event created successfully!');
      navigate('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Failed to create event. Please try again.');
    }
  };

  return (
    <div className="create-event-container">
      <div className="form-section">
        <form onSubmit={handleSubmit} className="form-page">
          <h2>Create Event</h2>
          <div className="form__group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
          </div>
          <div className="form__group">
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label>Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label>Capacity:</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label>Event Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit">Create Event</button>
        </form>
      </div>
      <div className="side-panel">
        <h3>About Event Creation</h3>
        <p>
          Use this form to provide all the necessary details about your event, including
          the title, description, date, location, and capacity.
        </p>
        <p>
          Make your event stand out by adding a vivid description and uploading an engaging image.
        </p>
        <button className="cta-button" onClick={() => navigate('/events')}>
          Explore Events
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;