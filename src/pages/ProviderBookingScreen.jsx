import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../database/firebaseConfig';
import { sendNotification } from '../utils/notificationUtils';
import { useNavigate } from 'react-router-dom';

export default function ProviderBookingsScreen() {
    
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState({});
  const [services, setServices] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('providerId', '==', userId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const fetchDetails = async () => {
      const userIds = bookings.map(booking => booking.userId);
      const serviceIds = bookings.map(booking => booking.serviceId);
      const uniqueUserIds = [...new Set(userIds)];
      const uniqueServiceIds = [...new Set(serviceIds)];

      const userDetails = {};
      for (const id of uniqueUserIds) {
        if (!users[id]) {
          const q = query(collection(db, 'users'), where('uid', '==', id));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            userDetails[id] = querySnapshot.docs[0].data();
          }
        }
      }

      const serviceDetails = {};
      for (const id of uniqueServiceIds) {
        if (!services[id]) {
          const serviceDoc = await getDoc(doc(db, 'services', id));
          if (serviceDoc.exists()) {
            serviceDetails[id] = serviceDoc.data();
          }
        }
      }

      setUsers(prev => ({ ...prev, ...userDetails }));
      setServices(prev => ({ ...prev, ...serviceDetails }));
    };

    if (bookings.length > 0) {
      fetchDetails();
    }
  }, [bookings]);

  const handleUpdateStatus = async (bookingId, newStatus, rejectionReason = '') => {
    const updateData = { status: newStatus };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    await updateDoc(doc(db, 'bookings', bookingId), updateData);
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    const booking = bookingDoc.data();

    if (booking) {
      let message = '';
      const title = services[booking.serviceId]?.title || 'a service';
      if (newStatus === 'in progress') message = `Your booking for "${title}" is now in progress.`;
      else if (newStatus === 'completed') message = `Your booking for "${title}" has been completed.`;
      else if (newStatus === 'rejected') message = `Your booking for "${title}" was rejected.`;

      if (message) {
        await sendNotification(booking.userId, 'status_update', message, bookingId);
      }
    }
  };

  const handleReject = (bookingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      handleUpdateStatus(bookingId, 'rejected', reason);
    } else if (reason !== null) {
      alert('Rejection reason cannot be empty.');
    }
  };

  const sortBookings = () => {
    return [...bookings].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'name') {
        const userA = users[a.userId]?.username || '';
        const userB = users[b.userId]?.username || '';
        return sortOrder === 'asc' ? userA.localeCompare(userB) : userB.localeCompare(userA);
      }
      return 0;
    });
  };

  return (
    <div className="min-h-screen bg-purple-100 p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="mr-4 text-purple-900">
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-purple-900">Provider Bookings</h1>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${sortBy === 'date' ? 'bg-purple-400 text-white' : 'bg-gray-300'}`}
          onClick={() => {
            setSortBy('date');
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
          }}
        >
          Sort by Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`px-4 py-2 rounded ${sortBy === 'name' ? 'bg-purple-400 text-white' : 'bg-gray-300'}`}
          onClick={() => {
            setSortBy('name');
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
          }}
        >
          Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <div className="space-y-4">
        {sortBookings().map(item => {
          const user = users[item.userId];
          const service = services[item.serviceId];

          return (
            <div key={item.id} className="bg-white p-4 rounded shadow">
              <p><strong>Service Title:</strong> {service?.title || 'Loading...'}</p>
              <p><strong>User:</strong> {user?.username || 'Loading...'}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Date:</strong> {item.createdAt?.toDate().toLocaleString()}</p>

              <div className="mt-2 flex space-x-2">
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'in progress')}
                      className="bg-green-300 px-3 py-1 rounded"
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="bg-red-300 px-3 py-1 rounded"
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
                {item.status === 'in progress' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'completed')}
                    className="bg-blue-300 px-3 py-1 rounded"
                  >
                    🏁 Complete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
