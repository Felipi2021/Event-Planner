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
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [storyVideo, setStoryVideo] = useState('');

    useEffect(() => {
        const fetchEventDetails = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:5001/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvent(response.data);
                setAttendeesCount(response.data.attendees_count);
                const userId = localStorage.getItem('userId');
                if (token && userId) {
                    try {
                        const attendanceResponse = await axios.get(
                            `http://localhost:5001/api/users/${userId}/attendance`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setIsAttending(attendanceResponse.data[id] || false);
                    } catch (attendanceErr) {
                        console.error('Error fetching attendance status:', attendanceErr);
                    }
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Nie udalo sie wczytac szczegolow wydarzenia.');
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
                toast.error('Nie udalo sie wczytac komentarzy.');
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
                toast.error('Musisz sie zalogowac, aby dolaczyc do wydarzenia.');
                return;
            }

            if (isAttending) {
                await axios.delete(`http://localhost:5001/api/events/${id}/attend`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { userId },
                });
                setIsAttending(false);
                setAttendeesCount((prev) => Math.max(prev - 1, 0));
                toast.info('Zrezygnowales z udzialu w tym wydarzeniu.');
            } else {
                await axios.post(
                    `http://localhost:5001/api/events/${id}/attend`,
                    { userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsAttending(true);
                setAttendeesCount((prev) => prev + 1);
                toast.success('Dolaczyles do tego wydarzenia.');
            }
        } catch (err) {
            console.error('Error updating attendance:', err);
            toast.error('Nie udalo sie zaktualizowac udzialu. Sprobuj ponownie.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Musisz sie zalogowac, aby dodac komentarz.');
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
            toast.success('Komentarz zostal dodany!');
        } catch (err) {
            console.error('Error submitting comment:', err);
            toast.error('Nie udalo sie dodac komentarza. Sprobuj ponownie.');
        }
    };

    const openUserStoryOrProfile = async (targetUserId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5001/api/users/${targetUserId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.data?.story_video) {
                setStoryVideo(`http://localhost:5001/uploads/${res.data.story_video}`);
                setStoryModalOpen(true);
                return;
            }
        } catch {
            // ignore and fallback
        }
        navigate(`/profile/${targetUserId}`);
    };

    if (loading) {
        return <p className="loading-text">Ladowanie szczegolow wydarzenia...</p>;
    }

    if (error) {
        return <p className="error-text">{error}</p>;
    }

    if (!event) {
        return <p className="not-found-text">Nie znaleziono wydarzenia.</p>;
    }

    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    return (
        <>
        <div className="event-details-container">
            <div className="event-header">
                <h2 className="event-title">
                    {event.title} - wydarzenie utworzone przez "{event.created_by_username || 'Nieznany'}" w miescie {event.location}, dnia {new Date(event.date).toLocaleDateString()}
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
                        <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Lokalizacja:</strong> {event.location}</p>
                        <p>
                            <strong>Utworzone przez:</strong>{' '}
                            <span
                                style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => navigate(`/profile/${event.created_by}`)} 
                            >
                                {event.created_by_username || 'Nieznany'}
                            </span>
                        </p>
                        <p><strong>Liczba miejsc:</strong> {event.capacity}</p>
                        <p><strong>Uczestnicy:</strong> {attendeesCount}</p>
                    </div>
                    <div className="event-description-section">
                        <h3 className="event-description-heading">Opis:</h3>
                        <p className="event-description">
                            {showFullDescription
                                ? event.description
                                : truncateText(event.description, 200)}
                            {event.description.length > 200 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="toggle-description-button"
                                >
                                    {showFullDescription ? 'Zwin' : 'Rozwin'}
                                </button>
                            )}
                        </p>
                        <button
                            className="attend-button"
                            onClick={handleAttendClick}
                        >
                            {isAttending ? 'Zrezygnuj z udzialu' : 'Dolacz'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="comments-section">
                <h3>Komentarze</h3>
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <img
                        src={`http://localhost:5001/uploads/${localStorage.getItem('profileImage') || 'default-avatar.png'}`}
                        alt="Twoj profil"
                        className="comment-profile-image"
                        onClick={() => {
                            const currentUserId = localStorage.getItem('userId');
                            if (currentUserId) {
                                openUserStoryOrProfile(currentUserId);
                            } else {
                                toast.error('Musisz byc zalogowany, aby zobaczyc swoj profil.');
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                    <textarea
                        placeholder="Dodaj komentarz..."
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
                                alt={`Avatar uzytkownika ${comment.username}`}
                                className="comment-card-image"
                                onClick={() => openUserStoryOrProfile(comment.user_id)} 
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
        {storyModalOpen && (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1200,
            }} onClick={() => setStoryModalOpen(false)}>
                <div style={{ width: 'min(540px, 92vw)', background: '#fff', borderRadius: '12px', padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <video src={storyVideo} controls autoPlay style={{ width: '100%', borderRadius: '8px' }} />
                    <button type="button" onClick={() => setStoryModalOpen(false)} style={{ marginTop: '0.7rem' }}>
                        Zamknij
                    </button>
                </div>
            </div>
        )}
        </>
    );
};

export default EventDetails;