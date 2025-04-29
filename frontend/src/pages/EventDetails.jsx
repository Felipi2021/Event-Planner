import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/EventDetails.scss';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState('');
    const [isAttending, setIsAttending] = useState(false);
    const [attendeesCount, setAttendeesCount] = useState(0);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/events/${id}`);
                setEvent(response.data);
                setAttendeesCount(response.data.attendees_count);
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (token && userId) {
                    const attendanceResponse = await axios.get(
                        `http://localhost:5001/api/users/${userId}/attendance`
                    );
                    setIsAttending(attendanceResponse.data[id] || false);
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/events/${id}/comments`);
                setComments(response.data || []); 
            } catch (err) {
                console.error('Error fetching comments:', err);
                toast.error('Failed to load comments.');
            }
        };

        fetchEventDetails();
        fetchComments();
    }, [id]);

    const handleAttendClick = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!token || !userId) {
                toast.error('You need to log in to mark attendance.');
                return;
            }

            if (isAttending) {
                await axios.delete(`http://localhost:5001/api/events/${id}/attend`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { userId },
                });
                setIsAttending(false);
                setAttendeesCount((prev) => Math.max(prev - 1, 0));
                toast.info('You are no longer attending this event.');
            } else {
                await axios.post(
                    `http://localhost:5001/api/events/${id}/attend`,
                    { userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsAttending(true);
                setAttendeesCount((prev) => prev + 1);
                toast.success('You are now attending this event.');
            }
        } catch (err) {
            console.error('Error updating attendance:', err);
            toast.error('Failed to update attendance. Please try again.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You need to log in to comment.');
                return;
            }

            const response = await axios.post(
                `http://localhost:5001/api/events/${id}/comments`,
                { text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setComments((prevComments) => [
                ...prevComments,
                {
                    id: response.data.id,
                    text: response.data.text,
                    username: response.data.username,
                    userAvatar: response.data.userAvatar,
                    user_id: response.data.user_id,
                    created_at: response.data.created_at,
                },
            ]);
            setNewComment('');
            toast.success('Comment added successfully!');
        } catch (err) {
            console.error('Error submitting comment:', err);
            toast.error('Failed to submit comment. Please try again.');
        }
    };

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
                <h2 className="event-title">
                    {event.title} - event created by "{event.created_by_username || 'Unknown'}" organized in {event.location} city on {new Date(event.date).toLocaleDateString()}
                </h2>
            </div>
            <div className="event-content">
                <div className="event-image-container">
                    {event.image && (
                        <div className="image-wrapper">
                            <img
                                src={`http://localhost:5001/uploads/${event.image}`}
                                alt={event.title}
                                className="event-image"
                            />
                        </div>
                    )}
                </div>
                <div className="event-container">
                    <div className="event-info">
                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                        <p>
                            <strong>Created By:</strong>{' '}
                            <span
                                style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => navigate(`/profile/${event.created_by}`)} 
                            >
                                {event.created_by_username || 'Unknown'}
                            </span>
                        </p>
                        <p><strong>Capacity:</strong> {event.capacity}</p>
                        <p><strong>Attendees:</strong> {attendeesCount}</p>
                    </div>
                    <div className="event-description-section">
                        <h3 className="event-description-heading">Description:</h3>
                        <p className="event-description">
                            {showFullDescription
                                ? event.description
                                : truncateText(event.description, 200)}
                            {event.description.length > 200 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="toggle-description-button"
                                >
                                    {showFullDescription ? 'View Less' : 'View More'}
                                </button>
                            )}
                        </p>
                        <button
                            className="attend-button"
                            onClick={handleAttendClick}
                        >
                            {isAttending ? 'Remove Attendance' : 'Attend'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="comments-section">
                <h3>Comments</h3>
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <img
                        src={`http://localhost:5001/uploads/${localStorage.getItem('profileImage') || 'default-avatar.png'}`}
                        alt="Your Profile"
                        className="comment-profile-image"
                        onClick={() => {
                            const currentUserId = localStorage.getItem('userId');
                            if (currentUserId) {
                                navigate(`/profile/${currentUserId}`);
                            } else {
                                toast.error('You need to be logged in to view your profile.');
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                    <textarea
                        placeholder="Add your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <button type="submit">→</button>
                </form>
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div className="comment-card" key={comment.id}>
                            <img
                                src={`http://localhost:5001/uploads/${encodeURIComponent(comment.userAvatar || 'default-avatar.png')}`}
                                alt={`${comment.username}'s avatar`}
                                className="comment-card-image"
                                onClick={() => navigate(`/profile/${comment.user_id}`)} 
                                style={{ cursor: 'pointer' }} 
                            />
                            <div className="comment-card-content">
                                <p><strong>{comment.username}:</strong></p>
                                <p className="comment-text">{comment.text}</p>
                                <p className="comment-date">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;