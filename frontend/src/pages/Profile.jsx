import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactStars from 'react-rating-stars-component';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import '../styles/profile.scss';

const Profile = () => {
  const { userId } = useParams();
  const loggedInUserId = localStorage.getItem('userId');
  const [userInfo, setUserInfo] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [createdEvents, setCreatedEvents] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showCreatedEvents, setShowCreatedEvents] = useState(false);
  const [showFavoriteEvents, setShowFavoriteEvents] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');

        const userResponse = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(userResponse.data);

        const ratingResponse = await axios.get(`http://localhost:5001/api/users/${userId}/average-rating`);
        setAverageRating(ratingResponse.data.averageRating);

        const createdEventsResponse = await axios.get(`http://localhost:5001/api/events?created_by=${userId}`);
        setCreatedEvents(createdEventsResponse.data);

        const favoriteEventsResponse = await axios.get(`http://localhost:5001/api/users/${userId}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteEvents(favoriteEventsResponse.data);

        // Fetch comment count
        const commentCountResponse = await axios.get(`http://localhost:5001/api/users/${userId}/comments/count`);
        setCommentCount(commentCountResponse.data.count);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        toast.error('Failed to load profile data.');
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleRatingChange = async (newRating) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to log in to rate.');
        return;
      }

      await axios.post(
        'http://localhost:5001/api/users/rate',
        { ratedId: userId, rating: newRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserRating(newRating);
      toast.success('Rating submitted successfully!');
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Failed to submit rating. Please try again.');
    }
  };
  const handleDescriptionSubmit = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token || !loggedInUserId) {
        toast.error('You need to log in to update your description.');
        return;
      }

      await axios.put(
        `http://localhost:5001/api/users/${loggedInUserId}/description`,
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
  const toggleDescription = (eventId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [eventId]: !prevState[eventId],
    }));
  };
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };
  return (
    <div className="page-container">
      <div className="profile-container">
        {userInfo ? (
          <>
            <div className="profile">
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
                <p>
                  <strong>Created:</strong>{' '}
                  {userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}
                </p>
                <p><strong>Comments Posted:</strong> {commentCount}</p> 
                <p><strong>Average Rating:</strong> {averageRating ? averageRating.toFixed(1) : 'No ratings yet'} / 5</p>
              </div>

            </div>
            <div className="description">
              <h3>Description</h3>
              {userId === loggedInUserId ? (
                isEditingDescription ? (
                  <div className="description-edit">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description about yourself..."
                      rows="3"
                    />
                    <div className="button-group">
                      <button
                        className="save-button"
                        onClick={handleDescriptionSubmit}
                        >
                          Save
                        </button>
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
                    <p>{description || 'No description added.'}</p>
                    <p
                      className="add-description"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      Add Description +
                    </p>
                  </>
                )
              ) : (
                <p>{userInfo.description || 'No description added.'}</p>
              )}
            </div>
            <div className="rating-section">
              {userId !== loggedInUserId ? (
                <ReactStars
                  count={5}
                  value={userRating}
                  onChange={handleRatingChange}
                  size={30}
                  isHalf={true}
                  activeColor="#ffd700"
                />
              ) : (
                <p>You cannot rate yourself.</p>
              )}
            </div>
          </>
        ) : (
          <p>Cannot load profile data...</p>
        )}
      </div>

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
                    : `${event.description.substring(0, 100)}...`}
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
                    : `${event.description.substring(0, 100)}...`}
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