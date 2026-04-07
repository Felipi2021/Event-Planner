import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import '../styles/map.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !Array.isArray(points) || points.length === 0) return undefined;

    const heatPoints = points.map((p) => [p.lat, p.lon, p.intensity || 0.8]);
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 40,
      maxZoom: 12,
      minOpacity: 0.5,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const HeatmapClickHandler = ({ hotspots, onSelect }) => {
  const map = useMapEvents({
    click(e) {
      if (!Array.isArray(hotspots) || hotspots.length === 0) return;
      let nearest = null;
      let nearestDistance = Infinity;

      hotspots.forEach((hotspot) => {
        const distance = map.distance(e.latlng, L.latLng(hotspot.lat, hotspot.lon));
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = hotspot;
        }
      });

      if (nearest && nearestDistance <= 1500) {
        onSelect(nearest);
      } else {
        onSelect(null);
      }
    },
  });

  return null;
};

const MapPage = () => {
  const [events, setEvents] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    const fetchAndGeocode = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventsData = Array.isArray(res.data) ? res.data : [];
        setEvents(eventsData);

        const uniqueLocations = [...new Set(eventsData.map((event) => event.location).filter(Boolean))];
        const geocoded = await Promise.all(
          uniqueLocations.map(async (location) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`
              );
              const data = await response.json();
              if (!Array.isArray(data) || data.length === 0) return null;
              return {
                location,
                lat: Number(data[0].lat),
                lon: Number(data[0].lon),
              };
            } catch {
              return null;
            }
          })
        );

        const geoMap = new Map(
          geocoded
            .filter((item) => item && Number.isFinite(item.lat) && Number.isFinite(item.lon))
            .map((item) => [item.location, item])
        );

        const eventMarkers = eventsData
          .map((event) => {
            const geo = geoMap.get(event.location);
            if (!geo) return null;
            return {
              eventId: event.id,
              title: event.title,
              location: event.location,
              date: event.date,
              image: event.image,
              lat: geo.lat,
              lon: geo.lon,
            };
          })
          .filter(Boolean);

        setMarkers(eventMarkers);
      } catch {
        setEvents([]);
        setMarkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGeocode();
  }, []);

  const mapCenter = useMemo(() => {
    if (markers.length > 0) return [markers[0].lat, markers[0].lon];
    return [52.2297, 21.0122];
  }, [markers]);

  const hotspots = useMemo(() => {
    const grouped = new Map();
    markers.forEach((marker) => {
      const key = marker.location;
      const existing = grouped.get(key);
      if (existing) {
        existing.events.push(marker);
      } else {
        grouped.set(key, {
          location: marker.location,
          lat: marker.lat,
          lon: marker.lon,
          events: [marker],
        });
      }
    });
    return Array.from(grouped.values()).map((hotspot) => ({
      ...hotspot,
      intensity: Math.min(3, 1.3 + hotspot.events.length * 0.45),
    }));
  }, [markers]);

  if (loading) {
    return <div className="map-page"><p>Ladowanie mapy wydarzen...</p></div>;
  }

  return (
    <div className="map-page">
      <h1>Mapa wydarzen</h1>
      {events.length === 0 ? (
        <p>Brak wydarzen do wyswietlenia na mapie.</p>
      ) : (
        <>
          <div className="events-map-wrapper">
            <MapContainer center={mapCenter} zoom={12} className="events-map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <HeatmapLayer points={hotspots} />
              <HeatmapClickHandler hotspots={hotspots} onSelect={setSelectedHotspot} />
            </MapContainer>
            {selectedHotspot && selectedHotspot.events[0] && (
              <div className="heatmap-map-tile">
                <h3>{selectedHotspot.events[0].title}</h3>
                <img
                  src={
                    selectedHotspot.events[0].image
                      ? `http://localhost:5001/uploads/${selectedHotspot.events[0].image}`
                      : '/uploads/default-event.jpg'
                  }
                  alt={selectedHotspot.events[0].title}
                />
                <Link to={`/events/${selectedHotspot.events[0].eventId}`}>Zobacz szczegoly</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MapPage;
