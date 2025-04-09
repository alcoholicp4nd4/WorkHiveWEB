import { useState, useEffect } from 'react';
import { MapPin, Search as SearchIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React from 'react';
const allProviders = [
  {
    id: 1,
    name: 'Sarah Johnson',
    service: 'Interior Designer',
    rating: 4.9,
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
      address: 'San Francisco, CA',
    },
  },
  {
    id: 2,
    name: 'Michael Chen',
    service: 'Personal Trainer',
    rating: 4.8,
    location: {
      latitude: 37.78525,
      longitude: -122.4354,
      address: 'San Francisco, CA',
    },
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    service: 'Hair Stylist',
    rating: 4.7,
    location: {
      latitude: 37.78925,
      longitude: -122.4344,
      address: 'San Francisco, CA',
    },
  },
  {
    id: 4,
    name: 'David Kim',
    service: 'Plumber',
    rating: 4.6,
    location: {
      latitude: 37.78625,
      longitude: -122.4334,
      address: 'San Francisco, CA',
    },
  },
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [price, setPrice] = useState(100);
  const [category, setCategory] = useState('All');
  const [radius, setRadius] = useState(5);
  const [locationStatus, setLocationStatus] = useState('not-started');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('success');
      },
      (err) => {
        setErrorMsg('Location permission denied.');
        setLocationStatus('error');
      }
    );
  }, []);

  const filteredProviders = allProviders.filter((p) => {
    return (
      (category === 'All' || p.service === category) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const userIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-purple-300 p-4 space-y-4">
        <div className="flex items-center bg-white rounded px-3 py-2">
          <SearchIcon className="text-gray-500 mr-2" size={20} />
          <input
            className="flex-1 outline-none"
            type="text"
            placeholder="Search services or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-600">Price: ${price}</label>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-gray-600">Distance: {radius} km</label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-gray-600">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded"
          >
            <option>All</option>
            <option>Interior Designer</option>
            <option>Personal Trainer</option>
            <option>Hair Stylist</option>
            <option>Plumber</option>
          </select>
        </div>
      </div>

      {locationStatus === 'loading' && (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          <p className="text-gray-500">Getting your location...</p>
        </div>
      )}

      {locationStatus === 'error' && (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          <MapPin className="text-pink-400" size={40} />
          <p className="text-center text-gray-600 mt-2">{errorMsg}</p>
          <button
            className="mt-4 bg-pink-200 px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {locationStatus === 'success' && location && (
        <div className="flex-1 h-[400px]">
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            <Circle
              center={[location.latitude, location.longitude]}
              radius={radius * 1000}
              pathOptions={{ fillColor: '#CB9DF0', color: '#CB9DF0', fillOpacity: 0.3 }}
            />
            {filteredProviders.map((provider) => (
              <Marker
                key={provider.id}
                position={[provider.location.latitude, provider.location.longitude]}
              >
                <Popup>
                  <strong>{provider.name}</strong>
                  <br />
                  {provider.service}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default Search;