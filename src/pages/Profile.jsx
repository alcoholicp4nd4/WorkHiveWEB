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

const menuItems = [
  
];

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

  const handleBecomeProvider = async () => {
    if (!user) return;

    try {
      await updateUserToProvider(user.uid);
      const updatedUser = { ...user, isProvider: true };
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("You're now a provider!");
    } catch (err) {
      alert('Failed to become a provider.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#CB9DF0] text-white text-center py-10 px-6">
        <div className="relative inline-block">
          <img
            src={profileImage || 'https://placehold.co/100'}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white mx-auto"
          />
          <label htmlFor="upload" className="absolute bottom-0 right-0 bg-black bg-opacity-60 p-1 rounded-full cursor-pointer">
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
        <h2 className="mt-4 text-2xl font-bold">{user ? user.username : 'Loading...'}</h2>
        <p className="text-sm">{user ? user.email : 'Loading...'}</p>
        {loading && <p className="mt-2 text-white">Uploading...</p>}
      </div>

      <div className="max-w-md mx-auto py-8 px-6 space-y-4">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center bg-[#FDDBBB] p-4 rounded-lg">
            <item.icon size={20} color="#333" />
            <span className="ml-4 text-gray-800 text-sm font-medium">{item.label}</span>
          </div>
        ))}

        <button
          onClick={() => navigate('/addservice')}
          className="w-full bg-[#A9D1F7] text-gray-800 p-4 rounded-lg text-left"
        >
          Add Service
        </button>

        {/* ✅ Booking Details Button */}
        <button
  onClick={() => navigate('/user-analytics')}
  className="w-full bg-[#CBF0F8] text-gray-800 p-4 rounded-lg text-left"
>
  Booking Details
</button>


        <button
          onClick={handleLogout}
          className="w-full bg-[#FFE5E5] text-[#D9534F] p-4 rounded-lg flex items-center"
        >
          <LogOut size={20} color="#D9534F" />
          <span className="ml-4 font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
