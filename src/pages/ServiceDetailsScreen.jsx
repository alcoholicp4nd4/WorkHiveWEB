import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../database/firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { sendNotification } from '../utils/notificationUtils';
import ServiceRating from '../components/ServiceRating';
import FavoriteButton from '../components/FavoriteButton';

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchService = async () => {
      const docRef = doc(db, 'services', serviceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setService({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchService();
  }, [serviceId]);

  const handleBookService = async () => {
    if (!service?.userId) return alert('Service provider ID is missing.');

    if (currentUser?.uid === service.userId) {
      alert('You cannot book your own service.');
      return;
    }

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('serviceId', '==', service.id),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingBooking = querySnapshot.docs[0].data();
        if (existingBooking.status !== 'completed') {
          alert('You have already booked this service.');
          return;
        }
      }

      await sendNotification(
        service.userId,
        'booking',
        `You have a new booking for "${service.title}".`
      );

      await addDoc(bookingsRef, {
        serviceId: service.id,
        providerId: service.userId,
        userId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('Service booked successfully!');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book the service.');
    }
  };

  if (!service) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 bg-white/90 px-4 py-2 rounded-full shadow-md z-50"
      >
        ← Back
      </button>

      <div className="w-full overflow-x-auto flex">
        {service.images?.length > 0 ? (
          service.images.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`service-${idx}`}
              className="w-screen h-[250px] object-cover"
            />
          ))
        ) : (
          <img
            src="https://via.placeholder.com/300"
            className="w-screen h-[250px] object-cover"
            alt="placeholder"
          />
        )}
      </div>

      <div className="p-5 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">{service.title}</h1>
        <div className="flex justify-between items-center -mt-1">
          <p className="text-sm text-gray-600">by {service.username}</p>
          <FavoriteButton serviceId={service.id} />
        </div>
        <p className="text-sm text-purple-500 font-medium">
          Category: {service.category}
        </p>

        <ServiceRating serviceId={service.id} readOnly={true} />

        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-1">
            Description
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {service.description}
          </p>
        </div>

        <div className="flex justify-between items-center py-2">
          <p className="text-lg font-semibold text-gray-800">
            {service.priceType === 'hourly'
              ? `$${service.price}/hr`
              : `$${service.price}`}
          </p>
          <p className="text-sm text-gray-600">⏱️ {service.deliveryTime}</p>
        </div>

        <button className="w-full bg-purple-400 text-white font-semibold py-3 rounded-xl shadow-md mb-2">
          💬 Contact Provider
        </button>

        <button
          className="w-full bg-purple-100 text-purple-700 font-semibold py-3 rounded-xl"
          onClick={handleBookService}
        >
          📦 Book Service
        </button>

        <button
          onClick={() =>
            navigate(`/profile/${service.userId}`)
          }
          className="w-full mt-4 bg-indigo-600 text-white font-bold py-2 rounded-md"
        >
          View Provider Profile
        </button>
      </div>
    </div>
  );
}
