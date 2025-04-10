import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search } from 'lucide-react';
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
      address: 'San Francisco, CA'
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
      address: 'San Francisco, CA'
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
      address: 'San Francisco, CA'
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
      address: 'San Francisco, CA'
    },
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState(null);
  const [price, setPrice] = useState(100);
  const [radius, setRadius] = useState(5);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-purple-300 p-4">
        <div className="flex items-center bg-white rounded-lg px-4 py-2 mb-4">
          <Search size={20} className="text-gray-600 mr-2" />
          <input
            type="text"
            placeholder="Search services or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-base focus:outline-none"
          />
        </div>

        <label className="text-sm text-gray-700">Price: ${price}</label>
        <input
          type="range"
          min="0"
          max="200"
          step="10"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full mb-4"
        />

        <label className="text-sm text-gray-700">Distance: {radius} km</label>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full mb-4"
        />

        <label className="text-sm text-gray-700">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-4 p-2 rounded-lg bg-white border border-gray-300"
        >
          <option value="All">All</option>
          <option value="Interior Designer">Interior Designer</option>
          <option value="Personal Trainer">Personal Trainer</option>
          <option value="Hair Stylist">Hair Stylist</option>
          <option value="Plumber">Plumber</option>
        </select>
      </div>

      <div className="flex-1">
        {position ? (
          <MapContainer
            center={position}
            zoom={13}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconAnchor: [12, 41] })}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={position}
              radius={radius * 1000}
              pathOptions={{ fillColor: '#CB9DF0', fillOpacity: 0.3, color: '#CB9DF0' }}
            />
            {allProviders
              .filter((provider) =>
                category === 'All' || provider.service === category
              )
              .map((provider) => (
                <Marker
                  key={provider.id}
                  position={{
                    lat: provider.location.latitude,
                    lng: provider.location.longitude,
                  }}
                >
                  <Popup>
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      <p className="text-sm">{provider.service}</p>
                      <p className="text-xs">Rating: {provider.rating}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-600">Fetching your location...</p>
          </div>
        )}
      </div>
    </div>
  );
}