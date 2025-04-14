import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/home.scss';

const Home = () => {
  const [latestEvents, setLatestEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [news, setNews] = useState([
    { title: 'Global Warming Alert', description: 'Temperatures are rising globally.' },
    { title: 'Tech Breakthrough', description: 'AI is transforming industries.' },
    { title: 'Sports Update', description: 'Team A wins the championship.' },
  ]);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Warsaw');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/events');
        const sortedEvents = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLatestEvents(sortedEvents.slice(0, 5));
      } catch (err) {
        console.error('Error fetching latest events:', err);
      }
    };

    const fetchWeather = async () => {
      try {
        const apiKey = '2c3dd76944303cadaf7dacfcde139d15';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        console.log('Weather API response:', response.data);
        setWeather(response.data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setWeather(null);
      }
    };

    fetchLatestEvents();
    fetchWeather();
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
      alert('You need to log in to mark favorites.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/api/events/${eventId}/favorite`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response.data.message);
      setFavorites((prev) =>
        prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div>
      <div className="welcome-section">
        <h1>Welcome to Event Planner</h1>
        <p>Discover events, stay updated, and plan your next adventure!</p>
      </div>
      <div className="home-container">
        <div className="events-section">
          <h2>Latest Events</h2>
          {latestEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-details">
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p>{event.description}</p>
              </div>
              <span
                className={`star-icon ${favorites.includes(event.id) ? 'favorite' : ''}`}
                onClick={() => handleFavorite(event.id)}
              >
                ★
              </span>
            </div>
          ))}
        </div>
        <div className="right-section">
          <div className="news-section">
            <h2>News Around the World</h2>
            <ul>
              {news.map((item, index) => (
                <li key={index}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="weather-section">
            <h2>Weather in {city}</h2>
            <form onSubmit={handleSearch} className="search-panel">
              <input
                type="text"
                placeholder="Enter city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button type="submit">Search</button>
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
                <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
                <p><strong>Condition:</strong> {weather.weather[0].description}</p>
                <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                <p><strong>Wind Speed:</strong> {weather.wind.speed} m/s</p>
              </div>
            ) : (
              <p>Loading weather data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;