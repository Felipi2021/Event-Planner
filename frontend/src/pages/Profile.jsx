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
  const [storyFile, setStoryFile] = useState(null);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyItems, setStoryItems] = useState([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse?.data) {
          setUserInfo(userResponse.data);
          setDescription(userResponse.data.description || '');
        } else {
          throw new Error('No user data found');
        }

        const ratingResponse = await axios.get(`http://localhost:5001/api/users/${userId}/average-rating`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAverageRating(ratingResponse.data?.averageRating || 0);

        const createdEventsResponse = await axios.get(`http://localhost:5001/api/events?created_by=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCreatedEvents(createdEventsResponse.data || []);

        const favoriteEventsResponse = await axios.get(`http://localhost:5001/api/users/${userId}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (favoriteEventsResponse?.data) {
          setFavoriteEvents(favoriteEventsResponse.data);
        } else {
          setFavoriteEvents([]);
        }

        const commentCountResponse = await axios.get(`http://localhost:5001/api/users/${userId}/comments/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommentCount(commentCountResponse.data?.count || 0);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        toast.error('Nie udalo sie wczytac danych profilu.');
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleRatingChange = async (newRating) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Musisz sie zalogowac, aby oceniac.');
        return;
      }

      await axios.post(
        'http://localhost:5001/api/users/rate',
        { ratedId: userId, rating: newRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserRating(newRating);
      toast.success('Ocena zostala zapisana!');
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Nie udalo sie zapisac oceny. Sprobuj ponownie.');
    }
  };

  const handleDescriptionSubmit = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token || !loggedInUserId) {
        toast.error('Musisz sie zalogowac, aby edytowac opis.');
        return;
      }

      await axios.put(
        `http://localhost:5001/api/users/${loggedInUserId}/description`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserInfo(prev => ({
        ...prev,
        description: description
      }));

      toast.success('Opis zostal zaktualizowany!');
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Error updating description:', err);
      toast.error('Nie udalo sie zaktualizowac opisu. Sprobuj ponownie.');
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

  const handleStoryUpload = async (fileOverride) => {
    const fileToUpload = fileOverride || storyFile;
    if (!fileToUpload) {
      toast.error('Wybierz plik video.');
      return;
    }
    try {
      setUploadingStory(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('story', fileToUpload);
      const res = await axios.put(`http://localhost:5001/api/users/${loggedInUserId}/story`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUserInfo((prev) => ({ ...prev, story_video: res.data?.storyVideo || prev?.story_video }));
      await loadStoriesForProfile(userId);
      setStoryFile(null);
      toast.success('Story zostalo zapisane.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Nie udalo sie zapisac story.');
    } finally {
      setUploadingStory(false);
    }
  };

  const loadStoriesForProfile = async (targetUserId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5001/api/users/${targetUserId}/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiStories = Array.isArray(res.data) ? res.data : [];
      if (apiStories.length > 0) {
        setStoryItems(apiStories);
        return apiStories;
      }

      if (userInfo?.story_video) {
        const fallbackStories = [{ id: 'legacy-story', video_filename: userInfo.story_video, created_at: new Date().toISOString() }];
        setStoryItems(fallbackStories);
        return fallbackStories;
      }

      setStoryItems([]);
      return [];
    } catch {
      if (userInfo?.story_video) {
        const fallbackStories = [{ id: 'legacy-story', video_filename: userInfo.story_video, created_at: new Date().toISOString() }];
        setStoryItems(fallbackStories);
        return fallbackStories;
      }
      setStoryItems([]);
      return [];
    }
  };

  const handleAvatarClick = () => {
    loadStoriesForProfile(userId).then((stories) => {
      if (stories.length === 0 && userId !== loggedInUserId) {
        return;
      }
      setStoryIndex(0);
      setStoryViewerOpen(true);
    });
  };

  const handleStoryFileChange = async (e) => {
    const selected = e.target.files?.[0] || null;
    setStoryFile(selected);
    if (selected) {
      await handleStoryUpload(selected);
    }
    e.target.value = '';
  };

  const goToPrevStory = () => {
    setStoryIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNextStory = () => {
    const maxIndex = userId === loggedInUserId ? storyItems.length : Math.max(storyItems.length - 1, 0);
    setStoryIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const isAddStoryTile = userId === loggedInUserId && storyIndex === storyItems.length;
  const currentStory = storyItems[storyIndex] || null;

  return (
    <>
    <div className="page-container">
      <div className="profile-container">
        {userInfo ? (
          <>
            <div className="profile">
              <div className="profile-image-container">
                {userId === loggedInUserId && (
                  <input
                    id="story-upload-input"
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleStoryFileChange}
                  />
                )}
                <img
                  src={`http://localhost:5001/uploads/${userInfo.image}`}
                  alt="Profil"
                  className={`profile-image-large ${userInfo?.story_video ? 'has-story' : ''}`}
                  onClick={handleAvatarClick}
                  style={{ cursor: userInfo?.story_video || userId === loggedInUserId ? 'pointer' : 'default' }}
                />
                {userId === loggedInUserId && (
                  <div className="story-hint-text">
                    {uploadingStory ? 'Wysylanie story...' : 'Kliknij ikonke, aby dodac/zmienic story'}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <p><strong>Nazwa uzytkownika:</strong> {userInfo.username}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p>
                  <strong>Utworzono:</strong>{' '}
                  {userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'Brak danych'}
                </p>
                <p><strong>Liczba komentarzy:</strong> {commentCount}</p> 
                <p><strong>Srednia ocena:</strong> {averageRating ? averageRating.toFixed(1) : 'Brak ocen'} / 5</p>
                {userId === loggedInUserId && (
                  <p><strong>Balans:</strong> {Number(userInfo.balance || 0).toFixed(2)} zl</p>
                )}
              </div>
            </div>
            <div className="description">
              <h3>Opis</h3>
              {userId === loggedInUserId ? (
                isEditingDescription ? (
                  <div className="description-edit">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Dodaj opis o sobie..."
                      rows="3"
                    />
                    <div className="button-group">
                      <button
                        className="save-button"
                        onClick={handleDescriptionSubmit}
                      >
                        Zapisz
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => {
                          setIsEditingDescription(false);
                          setDescription(userInfo.description || '');
                        }}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{userInfo.description || 'Brak opisu.'}</p>
                    <p
                      className="add-description"
                      onClick={() => {
                        setIsEditingDescription(true);
                        setDescription(userInfo.description || '');
                      }}
                    >
                      {userInfo.description ? 'Edytuj opis' : 'Dodaj opis +'}
                    </p>
                  </>
                )
              ) : (
                <p>{userInfo.description || 'Brak opisu.'}</p>
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
                <p>Nie mozesz ocenic samego siebie.</p>
              )}
            </div>
          </>
        ) : (
          <p>Nie mozna wczytac danych profilu...</p>
        )}
      </div>

      <div className="profile-section">
        <h3
          className="toggle-heading"
          onClick={() => setShowCreatedEvents(!showCreatedEvents)}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Utworzone wydarzenia {showCreatedEvents ? '▲' : '▼'}
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
                <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Lokalizacja:</strong> {event.location}</p>
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
                      {expandedDescriptions[event.id] ? 'Zwin' : 'Rozwin'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          showCreatedEvents && 
            <p>
              {userId === loggedInUserId 
                ? "Nie utworzyles jeszcze zadnych wydarzen." 
                : `${userInfo?.username || 'Ten uzytkownik'} nie utworzyl jeszcze zadnych wydarzen.`}
            </p>
        )}
      </div>
      <div className="profile-section">
        <h3
          className="toggle-heading"
          onClick={() => setShowFavoriteEvents(!showFavoriteEvents)}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Ulubione wydarzenia {showFavoriteEvents ? '▲' : '▼'}
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
                <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Lokalizacja:</strong> {event.location}</p>
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
                      {expandedDescriptions[event.id] ? 'Zwin' : 'Rozwin'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          showFavoriteEvents && 
            <p>
              {userId === loggedInUserId 
                ? "Nie masz jeszcze ulubionych wydarzen." 
                : `${userInfo?.username || 'Ten uzytkownik'} nie ma jeszcze ulubionych wydarzen.`}
            </p>
        )}
      </div>
    </div>
    {storyViewerOpen && (
      <div className="story-viewer-overlay" onClick={() => setStoryViewerOpen(false)}>
        <div className="story-viewer-card" onClick={(e) => e.stopPropagation()}>
          <div className="story-viewer-header">
            <img src={`http://localhost:5001/uploads/${userInfo.image}`} alt="Profil" />
            <span>{userInfo.username}</span>
          </div>
          {isAddStoryTile ? (
            <div className="story-add-tile">
              <p>Dodaj kolejne story</p>
              <button type="button" onClick={() => document.getElementById('story-upload-input')?.click()}>
                Wybierz filmik
              </button>
            </div>
          ) : currentStory ? (
            <video
              src={`http://localhost:5001/uploads/${currentStory.video_filename}`}
              controls
              autoPlay
              className="story-viewer-video"
            />
          ) : (
            <div className="story-add-tile"><p>Brak story</p></div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={goToPrevStory} disabled={storyIndex <= 0}>Poprzednie</button>
            <button
              type="button"
              onClick={goToNextStory}
              disabled={storyIndex >= (userId === loggedInUserId ? storyItems.length : Math.max(storyItems.length - 1, 0))}
            >
              Nastepne
            </button>
            <button type="button" onClick={() => setStoryViewerOpen(false)}>Zamknij</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Profile;