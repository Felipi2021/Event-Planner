import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CreateEvent.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationPicker = ({ pickedPosition, onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  if (!pickedPosition) return null;
  return <Marker position={[pickedPosition.lat, pickedPosition.lng]} />;
};

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [image, setImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [promotionDays, setPromotionDays] = useState('0');
  const [userBalance, setUserBalance] = useState(0);
  const [pickedPosition, setPickedPosition] = useState(null);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const sponsorContact = import.meta.env.VITE_SPONSOR_CONTACT || 'mailto:filip.andrzejczak06@gmail.com?subject=Chce%20wyroznic%20wydarzenie';
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    axios.get('/api/groups/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
      });
    if (userId) {
      axios.get(`http://localhost:5001/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUserBalance(Number(res.data?.balance || 0)))
        .catch(() => setUserBalance(0));
    }
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleTestTopUp = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('Musisz sie zalogowac.');
        return;
      }
      const res = await axios.post(
        `http://localhost:5001/api/users/${userId}/balance/topup`,
        { amount: 50 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserBalance(Number(res.data?.balance || 0));
      toast.success('Doladowano testowo +50 zl.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Nie udalo sie doladowac balansu.');
    }
  };

  const handlePickPosition = async (position) => {
    setPickedPosition(position);
    setResolvingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(position.lat)}&lon=${encodeURIComponent(position.lng)}`
      );
      const data = await response.json();
      const autoLocation = data?.display_name;
      if (autoLocation) {
        setLocation(autoLocation);
      } else {
        setLocation(`${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`);
      }
    } catch {
      setLocation(`${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`);
    } finally {
      setResolvingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Musisz sie zalogowac, aby utworzyc wydarzenie.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('location', location);
      if (pickedPosition) {
        formData.append('latitude', pickedPosition.lat);
        formData.append('longitude', pickedPosition.lng);
      }
      formData.append('capacity', capacity);
      if (selectedGroup) {
        formData.append('group_id', selectedGroup);
      }
      formData.append('promotionDays', promotionDays);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post('http://localhost:5001/api/events', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Wydarzenie zostalo utworzone.');
      const chargedAmount = Number(response?.data?.chargedAmount || 0);
      if (chargedAmount > 0) {
        const remaining = Number(response?.data?.remainingBalance);
        if (!Number.isNaN(remaining)) {
          setUserBalance(remaining);
        } else {
          setUserBalance((prev) => Math.max(prev - chargedAmount, 0));
        }
        toast.info(`Pobrano ${chargedAmount.toFixed(2)} zl za promowanie.`);
      }
      navigate('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error(err?.response?.data?.message || 'Nie udalo sie utworzyc wydarzenia. Sprobuj ponownie.');
    }
  };

  return (
    <div className="create-event-container">
      <div className="form-section">
        <form onSubmit={handleSubmit} className="form-page">
          <h2>Utworz wydarzenie</h2>
          <div className="form__group">
            <label htmlFor="title">Tytul:</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="description">Opis:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="date">Data:</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="location">Lokalizacja:</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <p style={{ marginTop: '0.5rem', color: '#555' }}>
              Kliknij na mapie, aby ustawic pinezke wydarzenia.
            </p>
            <MapContainer center={[52.2297, 21.0122]} zoom={12} className="event-location-map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker pickedPosition={pickedPosition} onPick={handlePickPosition} />
            </MapContainer>
            {pickedPosition && (
              <p style={{ marginTop: '0.5rem', color: '#555' }}>
                Wybrana pinezka: {pickedPosition.lat.toFixed(5)}, {pickedPosition.lng.toFixed(5)}
              </p>
            )}
            {resolvingLocation && (
              <p style={{ marginTop: '0.35rem', color: '#777' }}>
                Ustawiam lokalizacje na podstawie pinezki...
              </p>
            )}
          </div>
          <div className="form__group">
            <label htmlFor="capacity">Liczba miejsc:</label>
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="group">Grupa:</label>
            <select id="group" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
              <option value="">Bez grupy (wydarzenie publiczne)</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div className="form__group">
            <label htmlFor="promotion">Promuj wydarzenie:</label>
            <select id="promotion" value={promotionDays} onChange={e => setPromotionDays(e.target.value)}>
              <option value="0">Bez promocji (0 zl)</option>
              <option value="3">3 dni (7 zl)</option>
              <option value="7">7 dni (9 zl)</option>
              <option value="10">10 dni (10 zl)</option>
              <option value="30">30 dni (15 zl)</option>
            </select>
            <p style={{ marginTop: '0.5rem', color: '#555' }}>Twoj balans: {Number(userBalance).toFixed(2)} zl</p>
            <button type="button" onClick={handleTestTopUp}>
              Doladuj testowo +50 zl
            </button>
          </div>
          <div className="form__group">
            <label htmlFor="eventImage">Zdjecie wydarzenia:</label>
            <input
              id="eventImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit">Utworz wydarzenie</button>
        </form>
      </div>
      <div className="side-panel">
        <h3>O tworzeniu wydarzenia</h3>
        <p>
          Uzyj tego formularza, aby podac wszystkie potrzebne informacje o wydarzeniu:
          tytul, opis, date, lokalizacje i liczbe miejsc.
        </p>
        <p>
          Wyroznij swoje wydarzenie, dodaj ciekawy opis i atrakcyjne zdjecie.
        </p>
        <h3>Monetyzacja dla tworcow</h3>
        <p>
          Chcesz, aby Twoje wydarzenie bylo promowane mocniej na stronie? Skorzystaj z opcji
          platnego wyroznienia.
        </p>
        <button className="cta-button" onClick={() => window.open(sponsorContact, '_blank', 'noopener,noreferrer')}>
          Zglos wydarzenie do wyroznienia
        </button>
        <button className="cta-button" onClick={() => navigate('/events')}>
          Przegladaj wydarzenia
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;