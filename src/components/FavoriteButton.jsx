import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { Heart } from 'lucide-react';

const FavoriteButton = ({ serviceId, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      checkFavoriteStatus();
    }
  }, [serviceId, currentUser]);

  const checkFavoriteStatus = async () => {
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', currentUser.uid),
        where('serviceId', '==', serviceId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setIsFavorite(true);
        setFavoriteId(querySnapshot.docs[0].id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setIsFavorite(false);
        setFavoriteId(null);
        if (onFavoriteChange) onFavoriteChange(false);
      } else {
        const favoritesRef = collection(db, 'favorites');
        const newFavorite = await addDoc(favoritesRef, {
          userId: currentUser.uid,
          serviceId,
          createdAt: new Date()
        });
        setIsFavorite(true);
        setFavoriteId(newFavorite.id);
        if (onFavoriteChange) onFavoriteChange(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      style={{
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <Heart
        size={24}
        color={isFavorite ? '#FF3B30' : '#666'}
        fill={isFavorite ? '#FF3B30' : 'none'}
      />
    </button>
  );
};

export default FavoriteButton;
