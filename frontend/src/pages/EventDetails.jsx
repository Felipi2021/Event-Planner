import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/EventDetails.scss';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/events/${id}`);
                setEvent(response.data);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    if (loading) {
        return <p className="loading-text">Loading event details...</p>;
    }

    if (error) {
        return <p className="error-text">{error}</p>;
    }

    if (!event) {
        return <p className="not-found-text">Event not found.</p>;
    }

    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    return (
        <div className="event-details-container">
            <div className="event-header">
                <h2 className="event-title">{event.title}</h2>
                {event.image && (
                    <img
                        src={`http://localhost:5001/uploads/${event.image}`}
                        alt={event.title}
                        className="event-image"
                    />
                )}
            </div>
            <div className="event-info">
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Created By:</strong> {event.created_by_username || 'Unknown'}</p>
                <p className="event-description">
                    {showFullDescription
                        ? event.description
                        : truncateText(event.description, 200)}
                    {event.description.length > 200 && (
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#007bff',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            {showFullDescription ? 'View Less' : 'View More'}
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
};

export default EventDetails;