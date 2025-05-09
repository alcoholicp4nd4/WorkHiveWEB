import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search as SearchIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../database/firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

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
  const navigate = useNavigate();
  const [category, setCategory] = useState(paramCategory || 'All');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [position, setPosition] = useState(null);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Initializing...");
  const [locationSource, setLocationSource] = useState("none"); // 'firebase', 'browser', 'none'

  const [price, setPrice] = useState(100);
  const [radius, setRadius] = useState(5);

  const categories = predefinedCategories.some(cat => cat.value === paramCategory)
    ? predefinedCategories
    : paramCategory ? [...predefinedCategories, { label: paramCategory, value: paramCategory }] : predefinedCategories;

  const MIN_ACCURACY_THRESHOLD = 5000000000; // meters, increased for faster initial display if using Firebase
  const FIREBASE_LOCATION_MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds

  // Function to save location to Firebase
  const saveLocationToFirebase = async (userId, locData) => {
    if (!userId || !locData) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        lastKnownLocation: {
          lat: locData.lat,
          lng: locData.lng,
          accuracy: locData.accuracy,
          timestamp: serverTimestamp()
        }
      }, { merge: true });
      console.log("User location saved to Firebase:", locData);
    } catch (error) {
      console.error("Error saving location to Firebase:", error);
    }
  };

  useEffect(() => {
    let watchId = null;
    let isMounted = true;

    const fetchAndSetInitialLocation = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid) {
        if (isMounted) setLocationStatus("Fetching last known location from Firebase...");
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.lastKnownLocation && userData.lastKnownLocation.timestamp) {
              const locAge = Date.now() - userData.lastKnownLocation.timestamp.toDate().getTime();
              if (locAge < FIREBASE_LOCATION_MAX_AGE && userData.lastKnownLocation.lat && userData.lastKnownLocation.lng) {
                if (isMounted) {
                  setPosition({ lat: userData.lastKnownLocation.lat, lng: userData.lastKnownLocation.lng });
                  setCurrentAccuracy(userData.lastKnownLocation.accuracy || null);
                  setLocationStatus(`Using last known location (Accuracy: ${userData.lastKnownLocation.accuracy ? userData.lastKnownLocation.accuracy.toFixed(0) : 'N/A'}m). Attempting live update.`);
                  setLocationSource("firebase");
                }
              } else {
                 if (isMounted) setLocationStatus("Last known location is too old. Seeking live location...");
              }
            } else {
              if (isMounted) setLocationStatus("No previous location found. Seeking live location...");
            }
          } else {
            if (isMounted) setLocationStatus("User profile not found. Seeking live location...");
          }
        } catch (error) {
          console.error("Error fetching location from Firebase:", error);
          if (isMounted) setLocationStatus("Error fetching saved location. Seeking live location...");
        }
      }

      // Always attempt to get live location
      if (!navigator.geolocation) {
        if (isMounted) setLocationStatus("Geolocation is not supported by your browser.");
        return;
      }

      if (isMounted && locationSource !== 'firebase') {
        setLocationStatus("Attempting to get your current location...");
      } else if (isMounted) {
        setLocationStatus("Attempting to update live location...");
      }

      const handlePositionUpdate = (posData) => {
        if (!isMounted) return;
        const { latitude, longitude, accuracy } = posData.coords;
        setCurrentAccuracy(accuracy);
        setLocationSource("browser");
        console.log(`Live location update. Accuracy: ${accuracy}m`);

        if (accuracy <= MIN_ACCURACY_THRESHOLD) {
          const newPosition = { lat: latitude, lng: longitude };
          setPosition(newPosition);
          setLocationStatus(`Live location acquired. Accuracy: ${accuracy.toFixed(0)}m.`);
          if (currentUser && currentUser.uid) {
            saveLocationToFirebase(currentUser.uid, { ...newPosition, accuracy });
          }
        } else {
          // If we have a Firebase position or an old good position, don't override with a bad live one immediately
          // unless we have nothing yet.
          if (!position) {
             setLocationStatus(`Improving live accuracy. Current: ${accuracy.toFixed(0)}m. Target: < ${MIN_ACCURACY_THRESHOLD}m.`);
          } else {
             setLocationStatus(`Current live accuracy: ${accuracy.toFixed(0)}m (target < ${MIN_ACCURACY_THRESHOLD}m). Map shows best available.`);
          }
        }
      };

      const handleError = (error) => {
        if (!isMounted) return;
        console.error("Browser Geolocation Error:", error);
        let message = locationSource === 'firebase' && position ? "Could not update live location. Using last saved. Error: " : "Error getting live location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED: message += "Permission denied."; break;
          case error.POSITION_UNAVAILABLE: message += "Position unavailable."; break;
          case error.TIMEOUT: message += "Request timed out."; break;
          default: message += "Unknown error.";
        }
        setLocationStatus(message);
        // If live location fails and we don't have a Firebase location, it remains in error state
      };

      const geoOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
      
      navigator.geolocation.getCurrentPosition(handlePositionUpdate, handleError, geoOptions);
      watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handleError, geoOptions);
    };

    fetchAndSetInitialLocation();

    return () => {
      isMounted = false;
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // Empty dependency array: runs once on mount.

  useEffect(() => {
    setLoadingServices(true);
    let q;
    if (category && category !== 'All') {
      q = query(collection(db, 'services'), where('category', '==', category));
    } else {
      q = query(collection(db, 'services'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(fetched);
      setLoadingServices(false);
    }, (error) => {
      console.error("Firestore Error fetching services:", error);
      setLoadingServices(false);
    });

    return () => unsubscribe();
  }, [category]); // Removed isMounted from deps as it's from outer scope

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-purple-300 p-4">
        <div className="flex items-center bg-white rounded-lg px-4 py-2 mb-4">
          <SearchIcon size={20} className="text-gray-600 mr-2" />
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 text-center text-sm text-gray-700 bg-gray-100 shadow-sm">
          {locationStatus} (Source: {locationSource})
        </div>
        {position ? (
          <MapContainer
            center={position}
            zoom={13}
            className="w-full h-full flex-1 z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position} icon={userIcon}>
              <Popup>You are here (Accuracy: {currentAccuracy ? currentAccuracy.toFixed(0) : 'N/A'}m - {locationSource})</Popup>
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
                      <div className="w-48 p-1">
                        <img 
                          src={provider.profileImage || 'https://via.placeholder.com/80'}
                          alt={`Profile of ${provider.name || 'Provider'}`}
                          className="w-16 h-16 rounded-full mx-auto mb-2 object-cover shadow-md"
                          onError={(e) => {
                            if (e.target.src !== 'https://via.placeholder.com/80') {
                                e.target.onerror = null; 
                                e.target.src = 'https://via.placeholder.com/80';
                            }
                          }}
                        />
                        <h3 className="text-md font-semibold text-center text-gray-800 mb-1 truncate">{provider.name || 'N/A'}</h3>
                        <p className="text-xs text-gray-600 text-center mb-1 truncate">{provider.title || provider.service || 'Service not specified'}</p>
                        <p className="text-xs text-yellow-500 text-center mb-2">Rating: {provider.rating ? `${Number(provider.rating).toFixed(1)}/5` : 'N/A'}</p>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation();
                            navigate(`/ServiceDetails/${provider.id}`);
                          }}
                          className="w-full bg-purple-500 text-white text-xs py-1 px-2 rounded hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        ) : (
          <div className="flex-1 flex justify-center items-center h-full p-4">
            <p className="text-gray-600 px-4 text-center">
              {loadingServices ? 'Loading services...' : 'Map will display once location is determined. Please ensure location services are enabled.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}