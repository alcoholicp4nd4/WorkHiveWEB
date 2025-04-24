import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getCurrentUser } from '../database/authDatabase'; // Ensure this is implemented

export default function Chat() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProviders(fetched);
      } catch (err) {
        console.error('❌ Firestore fetch error:', err);
      }
    };

    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    fetchProviders();
    fetchUser();
  }, []);

  const handleChatClick = (providerId) => {
    if (currentUser) {
      navigate('/chat', {
        state: {
          currentUserId: currentUser.uid,
          providerId,
        },
      });
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Chats</h1>

        {providers.length === 0 ? (
          <p className="text-gray-600">No providers found.</p>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleChatClick(provider.id)}
                className="cursor-pointer flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">{provider.username}</h2>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
