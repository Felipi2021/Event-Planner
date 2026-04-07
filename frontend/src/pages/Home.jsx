import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/home.scss';

const Home = () => {
  const [latestEvents, setLatestEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Warszawa');
  const navigate = useNavigate(); 
  const [searchCity, setSearchCity] = useState('');
  const sponsorContact = import.meta.env.VITE_SPONSOR_CONTACT || 'mailto:twojmail@example.com?subject=Wspolpraca%20reklamowa%20na%20osiedlu';
  const truncateToOneLine = (text, maxLength = 110) =>
    (text || '').replace(/\s+/g, ' ').trim().slice(0, maxLength) + ((text || '').length > maxLength ? '...' : '');

  useEffect(() => {
    const NEWS_BATCH_SIZE = 4;

    const fetchLatestEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLatestEvents([]);
          return;
        }
        const response = await axios.get('http://localhost:5001/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLatestEvents((Array.isArray(response.data) ? response.data : []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching latest events:', err);
        setLatestEvents([]);
      }
    };

    const handleWeatherResponse = (response) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('Weather API response:', response);
      }
      setWeather(response.data);
    };

    const fetchWeather = async () => {
      try {
        const apiKey = '2c3dd76944303cadaf7dacfcde139d15';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        handleWeatherResponse(response);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setWeather(null);
      }
    };

    const fetchWorldEvents = async () => {
      try {
        setNewsLoading(true);
        setNewsError('');
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const response = await axios.get(
          `https://pl.wikipedia.org/api/rest_v1/feed/featured/${year}/${month}/${day}`
        );

        const rawWorldEvents = (response.data?.news || [])
          .map((item) => {
            const mainLink = item?.links?.[0];
            return {
              title: mainLink?.titles?.normalized || mainLink?.title || 'Wydarzenie swiatowe',
              description: mainLink?.extract || item?.story || 'Brak dodatkowego opisu.',
              url: mainLink?.content_urls?.desktop?.page || '',
            };
          });

        const uniqueByUrl = Array.from(
          new Map(rawWorldEvents.map((item) => [item.url || item.title, item])).values()
        );

        const selected = uniqueByUrl.slice(0, NEWS_BATCH_SIZE);

        if (selected.length === 0) {
          setNewsError('Brak aktualnych wydarzen do wyswietlenia.');
          setNews([]);
          return;
        }

        setNews(selected);
      } catch (err) {
        console.error('Error fetching world events:', err);
        setNewsError('Nie udalo sie pobrac aktualnych wydarzen ze swiata.');
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchLatestEvents();
    fetchWeather();
    fetchWorldEvents();
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity.trim());
      setSearchCity('');
    }
  };

  const handleFavorite = async (eventId) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      toast.error('Zaloguj sie, aby dodawac do ulubionych.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/api/events/${eventId}/favorite`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const isFavorite = favorites.includes(eventId);
      setFavorites((prev) =>
        isFavorite ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      );

      if (isFavorite) {
        toast.info('Usunieto wydarzenie z ulubionych.');
      } else {
        toast.success('Dodano wydarzenie do ulubionych!');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Nie udalo sie zaktualizowac ulubionych. Sprobuj ponownie.');
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`); 
  };

  return (
    <div>
      <div className="welcome-section">
        <h1>Witamy w Event Planner</h1>
        <p>Odkrywaj wydarzenia, badz na biezaco i planuj kolejne przygody!</p>
      </div>
      <div className="home-container">
      <div className="events-section">
          <h2>Najnowsze wydarzenia</h2>
          {latestEvents.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => handleEventClick(event.id)} 
              style={{ cursor: 'pointer' }}
            >
              <div className="event-details">
                <h3>{event.title}</h3>
                <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Lokalizacja:</strong> {event.location}</p>
                <p>{event.description}</p>
              </div>
              <span
                className={`star-icon ${favorites.includes(event.id) ? 'favorite' : ''}`}
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleFavorite(event.id);
                }}
              >
                ★
              </span>
            </div>
          ))}
        </div>
        <div className="right-section">
          <div className="news-section">
            <h2>Aktualne wydarzenia ze swiata</h2>
            {newsLoading ? (
              <p>Ladowanie wydarzen...</p>
            ) : newsError ? (
              <p>{newsError}</p>
            ) : (
              <ul>
                {news.map((item, index) => (
                  <li key={index}>
                    <h3>{item.title}</h3>
                    <p>{truncateToOneLine(item.description)}</p>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        Zobacz wiecej
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="weather-section">
            <h2>Pogoda w: {city}</h2>
            <form onSubmit={handleSearch} className="search-panel">
              <input
                type="text"
                placeholder="Wpisz miasto"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button type="submit">Szukaj</button>
            </form>
            {weather ? (
              <div className="weather-details">
                <img
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="weather-icon"
                  onError={(e) => {
                    console.error('Error loading weather icon:', e.target.src);
                    e.target.src = ''; 
                  }}
                />
                <p><strong>Temperatura:</strong> {weather.main.temp}°C</p>
                <p><strong>Warunki:</strong> {weather.weather[0].description}</p>
                <p><strong>Wilgotnosc:</strong> {weather.main.humidity}%</p>
                <p><strong>Predkosc wiatru:</strong> {weather.wind.speed} m/s</p>
              </div>
            ) : (
              <p>Ladowanie danych pogodowych...</p>
            )}
          </div>
          <div className="monetization-section">
            <h3>Reklama lokalna</h3>
            <p>
              Chcesz promowac lokalny biznes lub wydarzenie? Oferujemy platne wpisy sponsorowane.
            </p>
            <button type="button" onClick={() => window.open(sponsorContact, '_blank', 'noopener,noreferrer')}>
              Kontakt ws. reklamy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;