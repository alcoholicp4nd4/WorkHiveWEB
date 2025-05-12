import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  CreditCard,
  Shield,
  CircleHelp as HelpCircle,
  LogOut,
  Camera,
} from 'lucide-react';
import {
  uploadProfileImage,
  getCurrentUser,
  logoutUser,
  updateUserProfileImage,
  updateUserToProvider,
} from '../database/authDatabase';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfileImage(currentUser.profileImage || null);
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setLoading(true);
    const imageUrl = await uploadProfileImage(URL.createObjectURL(file), user.uid);
    if (imageUrl) {
      setProfileImage(imageUrl);
      await updateUserProfileImage(user.uid, imageUrl);
      localStorage.setItem(`profileImage_${user.username}`, imageUrl);
      alert('Profile picture updated!');
    } else {
      alert('Failed to update profile picture.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white animate-fadeIn">
      <div className="bg-[#CB9DF0] text-white text-center py-10 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-pulse"></div>
        <div className="relative z-10">
          <div className="relative inline-block animate-float">
            <img
              src={profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-white mx-auto shadow-xl transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
              }}
            />
            <label htmlFor="upload" className="absolute bottom-0 right-0 bg-black bg-opacity-60 p-2 rounded-full cursor-pointer transform hover:scale-110 transition-transform duration-200">
              <Camera size={20} color="#fff" />
            </label>
            <input
              type="file"
              id="upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold animate-fadeIn animation-delay-200">
            {user ? user.username : 'Loading...'}
          </h2>
          <p className="text-sm opacity-90 animate-fadeIn animation-delay-300">
            {user ? user.email : 'Loading...'}
          </p>
          {loading && (
            <div className="mt-2 flex justify-center">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto py-8 px-6 space-y-4">
        <button
          onClick={() => navigate('/addservice')}
          className="w-full bg-[#A9D1F7] text-gray-800 p-4 rounded-lg text-left transform hover:scale-102 transition-all duration-300 animate-fadeIn animation-delay-400 hover:shadow-lg"
        >
          Add Service
        </button>

        <button
          onClick={() => navigate('/user-analytics')}
          className="w-full bg-[#CBF0F8] text-gray-800 p-4 rounded-lg text-left transform hover:scale-102 transition-all duration-300 animate-fadeIn animation-delay-500 hover:shadow-lg"
        >
          Booking Details
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-[#FFE5E5] text-[#D9534F] p-4 rounded-lg flex items-center justify-between transform hover:scale-102 transition-all duration-300 animate-fadeIn animation-delay-600 hover:shadow-lg"
        >
          <span className="font-medium">Log Out</span>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}