import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/global.scss';

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [createdEvents, setCreatedEvents] = useState([]);
    const [favoriteEvents, setFavoriteEvents] = useState([]);
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

    return (
        <div className="page-container">
            <h2>My Profile</h2>
            {userInfo && (
                <div className="profile-info">
                    <img
                        src={`http://localhost:5001/uploads/${userInfo.image}`}
                        alt="Profile"
                        className="profile-image-large"
                    />
                    <p><strong>Username:</strong> {userInfo.username}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                </div>
            )}
            <div className="profile-section">
                <h3>Created Events</h3>
                {createdEvents.length > 0 ? (
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
                    <p>You haven't created any events yet.</p>
                )}
            </div>
            <div className="profile-section">
                <h3>Favorite Events</h3>
                {favoriteEvents.length > 0 ? (
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
                                        >
                                            {expandedDescriptions[event.id] ? 'View Less' : 'View More'}
                                        </button>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You haven't marked any events as favorites yet.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;