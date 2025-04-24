import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getAuth } from 'firebase/auth';

const ServiceRating = ({ serviceId, onRatingSubmit, readOnly = false }) => {
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(0);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAverageRating();
    if (currentUser && !readOnly) fetchUserRating();
  }, [serviceId]);

  const fetchAverageRating = async () => {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('serviceId', '==', serviceId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        let total = 0;
        snapshot.forEach((doc) => total += doc.data().rating);
        setAverageRating((total / snapshot.size).toFixed(1));
      }
    } catch (err) {
      console.error('Fetch avg error:', err);
    }
  };

  const fetchUserRating = async () => {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('serviceId', '==', serviceId),
        where('userId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userRate = snap.docs[0].data().rating;
        setRating(userRate);
        setUserRating(userRate);
        setTempRating(userRate);
      }
    } catch (err) {
      console.error('Fetch user rating error:', err);
    }
  };

  const handleRatingClick = (value) => {
    if (readOnly) return;
    setTempRating(value);
  };

  const handleSubmitRating = async () => {
    if (!currentUser) return alert('Please login to rate.');

    try {
      const q = query(
        collection(db, 'ratings'),
        where('serviceId', '==', serviceId),
        where('userId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        await addDoc(collection(db, 'ratings'), {
          serviceId,
          userId: currentUser.uid,
          rating: tempRating,
          createdAt: new Date()
        });
      } else {
        await updateDoc(doc(db, 'ratings', snap.docs[0].id), {
          rating: tempRating,
          updatedAt: new Date()
        });
      }

      setRating(tempRating);
      setUserRating(tempRating);
      setIsEditing(false);
      fetchAverageRating();
      onRatingSubmit?.(tempRating);
    } catch (err) {
      console.error('Submit rating error:', err);
      alert('Error submitting rating');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleRatingClick(star)}
            className={`cursor-pointer text-2xl ${
              star <= (isEditing ? tempRating : rating || averageRating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>

      <p className="text-sm text-center text-gray-600 mb-2">
        Average: {averageRating} ⭐
      </p>

      {!readOnly && (
        <>
          {userRating > 0 && !isEditing ? (
            <button
              className="w-full text-indigo-600 font-medium border border-indigo-600 rounded-lg py-2"
              onClick={() => setIsEditing(true)}
            >
              Change Rating
            </button>
          ) : (
            <button
              disabled={tempRating === 0}
              className={`w-full text-white font-medium rounded-lg py-2 ${
                tempRating === 0 ? 'bg-gray-300' : 'bg-indigo-600'
              }`}
              onClick={handleSubmitRating}
            >
              {userRating > 0 ? 'Update Rating' : 'Confirm Rating'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceRating;
