import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { db } from '../database/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const predefinedCategories = [
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

// Define a custom blue icon for the user
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],    // Size of the icon
  iconAnchor: [12, 41],   // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34],  // Point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41]    // Size of the shadow
});

// Define the default icon for providers (optional, but good practice)
const providerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function SearchScreen() {
  const { category: paramCategory } = useParams();
  const [category, setCategory] = useState(paramCategory || 'All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState(null);
  const [price, setPrice] = useState(100);
  const [radius, setRadius] = useState(5);

  const categories = predefinedCategories.some(cat => cat.value === paramCategory)
    ? predefinedCategories
    : paramCategory ? [...predefinedCategories, { label: paramCategory, value: paramCategory }] : predefinedCategories;

  useEffect(() => {
    let watchId;

    const getLocation = () => {
      const options = {
        enableHighAccuracy: true, // Use high accuracy mode
        timeout: 10000,          // Timeout after 10 seconds
        maximumAge: 0            // Don't use cached position
      };

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Location updated - Accuracy: ${accuracy} meters`);
          setPosition({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Geolocation Error:', error);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.error('Location permission denied');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('Location information unavailable');
              break;
            case error.TIMEOUT:
              console.error('Location request timed out');
              break;
            default:
              console.error('Unknown error occurred');
          }
        },
        options
      );
    };

    // Try to get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Initial position - Accuracy: ${accuracy} meters`);
        setPosition({ lat: latitude, lng: longitude });
        // Start watching position after getting initial position
        getLocation();
      },
      (error) => {
        console.error('Initial position error:', error);
        // Still try to watch position even if initial position fails
        getLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Cleanup function to stop watching position
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    let q;
    if (category && category !== 'All') {
      q = query(collection(db, 'services'), where('category', '==', category));
    } else {
      q = query(collection(db, 'services'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(`Fetched ${fetched.length} services for category: ${category}`);
      setServices(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
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
          <option value="All" key="all-option">All</option>
          {categories.map((cat) => (
            <option key={`category-${cat.value}`} value={cat.value}>
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
            <Marker position={position} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={position}
              radius={radius * 1000}
              pathOptions={{ fillColor: '#CB9DF0', fillOpacity: 0.3, color: '#CB9DF0' }}
            />
            {services
              .filter((provider) =>
                !searchQuery || (provider.name && provider.name.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((provider) => {
                if (!provider.location || typeof provider.location.latitude !== 'number' || typeof provider.location.longitude !== 'number') {
                  console.warn(`Provider ${provider.name || provider.id} has invalid location data:`, provider.location);
                  return null;
                }
                return (
                  <Marker
                    key={provider.id}
                    position={{
                      lat: provider.location.latitude,
                      lng: provider.location.longitude,
                    }}
                    icon={providerIcon}
                  >
                    <Popup>
                      <div>
                        <p className="font-semibold">{provider.name}</p>
                        <p className="text-sm">{provider.service || 'Service not specified'}</p>
                        <p className="text-xs">Rating: {provider.rating || 'N/A'}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
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