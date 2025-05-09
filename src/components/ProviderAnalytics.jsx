// src/components/ProviderAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

export default function ProviderAnalytics({ providerId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const bookingsSnap = await getDocs(
        query(collection(db, 'bookings'), where('providerId', '==', providerId))
      );

      const counts = {};

      bookingsSnap.forEach(doc => {
        const booking = doc.data();
        const day = dayjs(booking.createdAt?.toDate?.() || new Date()).format('YYYY-MM-DD');
        counts[day] = (counts[day] || 0) + 1;
      });

      const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }));
      setData(chartData.sort((a, b) => a.date.localeCompare(b.date)));
    };

    fetchBookings();
  }, [providerId]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border mt-6">
      <h3 className="text-lg font-semibold mb-4">📈 Your Bookings Over Time</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500">No bookings yet.</p>
      )}
    </div>
  );
}
