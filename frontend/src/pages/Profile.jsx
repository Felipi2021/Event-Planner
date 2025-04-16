import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.scss';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showCreatedEvents, setShowCreatedEvents] = useState(false);
  const [showFavoriteEvents, setShowFavoriteEvents] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          toast.error('You need to log in to access your profile.');
          return;
        }

        const userResponse = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(userResponse.data);

        const createdEventsResponse = await axios.get(`http://localhost:5001/api/events?created_by=${userId}`);
        setCreatedEvents(createdEventsResponse.data);

        const favoriteEventsResponse = await axios.get(`http://localhost:5001/api/users/${userId}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteEvents(favoriteEventsResponse.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        toast.error('Failed to load profile data.');
      }
    };

    fetchProfileData();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const toggleDescription = (eventId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };
  const handleDescriptionSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        toast.error('You need to log in to update your description.');
        return;
      }

      await axios.put(
        `http://localhost:5001/api/users/${userId}/description`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Description updated successfully!');
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Error updating description:', err);
      toast.error('Failed to update description. Please try again.');
    }
  };
  return (
    <div className="page-container">
      <h2>My Profile</h2>
      {userInfo && (
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={`http://localhost:5001/uploads/${userInfo.image}`}
              alt="Profile"
              className="profile-image-large"
            />
          </div>
          <div className="profile-info">
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            {isEditingDescription ? (
              <div className="description-edit">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description about yourself..."
                  rows="3"
                ></textarea>
                <div className="button-group">
                  <button onClick={handleDescriptionSubmit}>Save</button>
                  <button
                    className="cancel-button"
                    onClick={() => setIsEditingDescription(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Description:</strong> {description || 'No description added.'}</p>
                <button onClick={() => setIsEditingDescription(true)}>Add Description +</button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="profile-section">
        <h3
          className="toggle-heading"
          onClick={() => setShowCreatedEvents(!showCreatedEvents)}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Events Created {showCreatedEvents ? '▲' : '▼'}
        </h3>
        {showCreatedEvents && createdEvents.length > 0 ? (
          createdEvents.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => handleEventClick(event.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-info">
                <h4>{event.title}</h4>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p>
                  {expandedDescriptions[event.id]
                    ? event.description
                    : truncateText(event.description, 100)}
                  {event.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(event.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {expandedDescriptions[event.id] ? 'View Less' : 'View More'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          showCreatedEvents && <p>You haven't created any events yet.</p>
        )}
      </div>
      <div className="profile-section">
        <h3
          className="toggle-heading"
          onClick={() => setShowFavoriteEvents(!showFavoriteEvents)}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Events Marked as Favorite {showFavoriteEvents ? '▲' : '▼'}
        </h3>
        {showFavoriteEvents && favoriteEvents.length > 0 ? (
          favoriteEvents.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => handleEventClick(event.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-info">
                <h4>{event.title}</h4>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p>
                  {expandedDescriptions[event.id]
                    ? event.description
                    : truncateText(event.description, 100)}
                  {event.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(event.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {expandedDescriptions[event.id] ? 'View Less' : 'View More'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          showFavoriteEvents && <p>You haven't marked any events as favorites yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;