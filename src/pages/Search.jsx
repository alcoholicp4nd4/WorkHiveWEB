import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { db } from '../database/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const categories = [
  { label: 'Web Development', value: 'web-development' },
  { label: 'Mobile App Development', value: 'mobile-app-development' },
  { label: 'Software Engineering', value: 'software-engineering' },
  { label: 'UI/UX Design', value: 'ui-ux-design' },
  { label: 'QA Testing', value: 'qa-testing' },
  { label: 'Game Development', value: 'game-development' },
  { label: 'DevOps & Cloud', value: 'devops-cloud' },
  { label: 'Graphic Design', value: 'graphic-design' },
  { label: 'Logo Design', value: 'logo-design' },
  { label: 'Animation', value: 'animation' },
  { label: 'Video Editing', value: 'video-editing' },
  { label: 'Photography', value: 'photography' },
  { label: 'Branding & Identity', value: 'branding' },
  { label: 'Illustration', value: 'illustration' },
  { label: 'SEO Optimization', value: 'seo' },
  { label: 'Digital Marketing', value: 'digital-marketing' },
  { label: 'Social Media Management', value: 'social-media' },
  { label: 'Email Marketing', value: 'email-marketing' },
  { label: 'Copywriting', value: 'copywriting' },
  { label: 'Business Consulting', value: 'business-consulting' },
  { label: 'Sales Strategy', value: 'sales-strategy' },
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Electrical Work', value: 'electrical' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Moving Services', value: 'moving' },
  { label: 'Handyman Services', value: 'handyman' },
  { label: 'Pest Control', value: 'pest-control' },
  { label: 'Landscaping', value: 'landscaping' },
  { label: 'Tutoring', value: 'tutoring' },
  { label: 'Language Teaching', value: 'language-teaching' },
  { label: 'Life Coaching', value: 'life-coaching' },
  { label: 'Career Coaching', value: 'career-coaching' },
  { label: 'Test Preparation', value: 'test-prep' },
  { label: 'Fitness Training', value: 'fitness-training' },
  { label: 'Yoga Instruction', value: 'yoga' },
  { label: 'Therapy & Counseling', value: 'therapy' },
  { label: 'Nutrition Planning', value: 'nutrition' },
  { label: 'Beauty & Skincare', value: 'beauty' },
  { label: 'Hair Styling', value: 'hair-styling' },
  { label: 'Event Planning', value: 'event-planning' },
  { label: 'Virtual Assistance', value: 'virtual-assistance' },
  { label: 'Data Entry', value: 'data-entry' },
  { label: 'Translation Services', value: 'translation' },
  { label: 'Custom Orders', value: 'custom-orders' },
];

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
  const { category: paramCategory } = useParams();
  const [category, setCategory] = useState('All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState(null);
  const [price, setPrice] = useState(100);
  const [radius, setRadius] = useState(5);

  // Sync category with URL param on mount
  useEffect(() => {
    if (paramCategory) {
      setCategory(paramCategory);
    }
  }, [paramCategory]);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition({ lat: latitude, lng: longitude });
      },
      (error) => console.error('Error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (category && category !== 'All') {
      const q = query(collection(db, 'services'), where('category', '==', category));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(fetched);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setServices([]);
      setLoading(false);
    }
  }, [category]);

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
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
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
            {services
  .filter((provider) =>
    (category === 'All' || provider.category === category) &&
    (!searchQuery || provider.name.toLowerCase().includes(searchQuery.toLowerCase()))
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