import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../database/firebaseConfig'; // Assuming this path is correct for web
// import { sendNotification } from '../utils/notificationUtils'; // Ensure this utility is compatible/available for web

// Placeholder for sendNotification if the RN specific one isn't available/compatible
const sendNotification = async (userId, type, message, bookingId) => {
  console.log(`Notification to ${userId} (${type}): ${message} [Booking: ${bookingId}]`);
  // Implement actual web notification logic here (e.g., using FCM for web, or another service)
};


export default function ProviderBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState({});
  const [services, setServices] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Fetch bookings for the current provider
  useEffect(() => {
    if (!userId) return; // Don't query if user is not logged in

    const q = query(collection(db, 'bookings'), where('providerId', '==', userId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    }, (error) => {
      console.error("Error fetching bookings: ", error);
    });
    return () => unsubscribe();
  }, [userId]);

  // Fetch user and service details related to the bookings
  useEffect(() => {
    const fetchDetails = async () => {
      const userIds = bookings.map(booking => booking.userId).filter(id => id);
      const serviceIds = bookings.map(booking => booking.serviceId).filter(id => id);
      const uniqueUserIds = [...new Set(userIds)];
      const uniqueServiceIds = [...new Set(serviceIds)];

      const userDetails = {};
      // Fetch users that aren't already fetched
      const usersToFetch = uniqueUserIds.filter(id => !users[id]);
      if (usersToFetch.length > 0) {
           // Firestore limitation: 'in' query takes max 10 elements. Need to batch if more.
           // Simple approach for now, might need batching for large numbers.
           const userQuery = query(collection(db, 'users'), where('uid', 'in', usersToFetch.slice(0, 10)));
           const userSnap = await getDocs(userQuery);
           userSnap.forEach(doc => {
              userDetails[doc.data().uid] = doc.data();
           });
      }


      const serviceDetails = {};
      // Fetch services that aren't already fetched
      const servicesToFetch = uniqueServiceIds.filter(id => !services[id]);
      for (const id of servicesToFetch) {
        try {
          const serviceDoc = await getDoc(doc(db, 'services', id));
          if (serviceDoc.exists()) {
            serviceDetails[id] = serviceDoc.data();
          }
        } catch (error) {
          console.error(`Error fetching service ${id}: `, error);
        }
      }

      // Only update state if new details were fetched
      if (Object.keys(userDetails).length > 0) {
        setUsers(prevUsers => ({ ...prevUsers, ...userDetails }));
      }
      if (Object.keys(serviceDetails).length > 0) {
        setServices(prevServices => ({ ...prevServices, ...serviceDetails }));
      }
    };

    if (bookings.length > 0) {
      fetchDetails();
    }
  }, [bookings]); // Rerun when bookings change

  const handleUpdateStatus = async (bookingId, newStatus, rejectionReason = '') => {
    if (!bookingId) return;
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updateData = { status: newStatus };
      if (newStatus === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      await updateDoc(bookingRef, updateData);

      // Send notification after status update
      const bookingDoc = await getDoc(bookingRef);
      const booking = bookingDoc.data();
      if (booking && booking.userId && booking.serviceId) {
        const serviceTitle = services[booking.serviceId]?.title || 'a service';
        let message = '';
        if (newStatus === 'in progress') {
          message = `Your booking for "${serviceTitle}" is now in progress.`;
        } else if (newStatus === 'completed') {
          message = `Your booking for "${serviceTitle}" has been completed.`;
        } else if (newStatus === 'rejected') {
          message = `Your booking for "${serviceTitle}" was rejected. Reason: ${rejectionReason || 'Not specified'}`;
        }
        if (message) {
          await sendNotification(booking.userId, 'status_update', message, bookingId);
        }
      }
    } catch (error) {
      console.error(`Error updating booking ${bookingId} to ${newStatus}: `, error);
      // Consider showing an error message to the user
    }
  };

  const handleReject = (bookingId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) { // User clicked cancel
      return;
    }
    if (reason) {
      handleUpdateStatus(bookingId, 'rejected', reason);
    } else {
      alert('Error: Rejection reason cannot be empty.'); // Use browser alert
    }
  };

  const sortBookings = () => {
    return [...bookings].sort((a, b) => {
      try {
        if (sortBy === 'date') {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'name') {
          const userA = users[a.userId]?.username || '';
          const userB = users[b.userId]?.username || '';
          return sortOrder === 'asc'
            ? userA.localeCompare(userB)
            : userB.localeCompare(userA);
        }
      } catch (error) {
        console.error("Sorting error:", error, "Data:", a, b);
      }
      return 0;
    });
  };

  const sortedBookings = sortBookings(); // Calculate sorted list once

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center text-purple-700">Manage Bookings</h1>
      {/* Filter Controls */}
      <div className="flex justify-center gap-4 mb-6 p-3 bg-white rounded-lg shadow">
        <button
          className={`px-4 py-2 rounded font-semibold ${sortBy === 'date' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => {
            setSortBy('date');
            setSortOrder(prev => (sortBy === 'date' ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'));
          }}
        >
          Sort by Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${sortBy === 'name' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => {
            setSortBy('name');
            setSortOrder(prev => (sortBy === 'name' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
          }}
        >
          Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {sortedBookings.length === 0 && !loading && (
           <p className="text-center text-gray-500">No bookings found.</p>
        )}
        {loading && (
           <p className="text-center text-gray-500">Loading bookings...</p>
        )}
        {sortedBookings.map(item => {
          const user = users[item.userId];
          const service = services[item.serviceId];
          const bookingDate = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Invalid Date';

          return (
            <div key={item.id} className="p-4 bg-white border border-purple-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <p className="font-semibold text-purple-800">
                Service: <span className="font-normal text-black">{service ? service.title : 'Loading...'}</span>
              </p>
              <p className="font-semibold text-purple-800">
                User: <span className="font-normal text-black">{user ? user.username : 'Loading...'}</span>
              </p>
              <p className="font-semibold text-purple-800">
                Status: <span className={`font-normal ${item.status === 'completed' ? 'text-green-600' : item.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}`}>{item.status}</span>
              </p>
              <p className="font-semibold text-purple-800">
                Date: <span className="font-normal text-black">{bookingDate}</span>
              </p>
              {item.status === 'rejected' && item.rejectionReason && (
                <p className="font-semibold text-red-700 mt-1">
                  Reason: <span className="font-normal italic text-red-600">{item.rejectionReason}</span>
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'in progress')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
                {item.status === 'in progress' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'completed')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                  >
                    🏁 Mark as Complete
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
