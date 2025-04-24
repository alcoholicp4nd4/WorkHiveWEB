import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchFavorites = async () => {
    try {
      // Get user's favorite service IDs
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const favoriteIds = querySnapshot.docs.map(doc => doc.data().serviceId);
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch the actual service details
      const services = [];
      for (const serviceId of favoriteIds) {
        const serviceDoc = await getDoc(doc(db, 'services', serviceId));
        if (serviceDoc.exists()) {
          services.push({ id: serviceId, ...serviceDoc.data() });
        }
      }

      setFavorites(services);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFavorites();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading favorites...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={styles.emptyContainer}>
        <p style={styles.emptyText}>Please login to view your favorites</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p style={styles.emptyText}>No favorite services yet</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        {favorites.map(item => (
          <div key={item.id} style={styles.serviceCard} onClick={() => {/* Navigate to service details */}}>
            <img
              src={item.images?.[0] || 'https://via.placeholder.com/300'}
              alt={item.title}
              style={styles.serviceImage}
            />
            <div style={styles.serviceInfo}>
              <p style={styles.serviceTitle}>{item.title}</p>
              <p style={styles.servicePrice}>
                {item.priceType === 'hourly' ? `$${item.price}/hr` : `$${item.price}`}
              </p>
              <p style={styles.serviceProvider}>by {item.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '15px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  emptyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: '15px',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  serviceImage: {
    width: '100%',
    height: '200px',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    objectFit: 'cover',
  },
  serviceInfo: {
    padding: '15px',
  },
  serviceTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '5px',
  },
  servicePrice: {
    fontSize: '16px',
    color: '#5A31F4',
    fontWeight: '600',
    marginBottom: '5px',
  },
  serviceProvider: {
    fontSize: '14px',
    color: '#666',
  },
};
