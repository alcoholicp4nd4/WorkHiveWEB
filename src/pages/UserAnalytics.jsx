import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../database/authDatabase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import dayjs from 'dayjs';

export default function UserAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const q = query(collection(db, 'bookings'), where('providerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const bookings = [];

      querySnapshot.forEach(doc => {
        const item = doc.data();
        if (item.createdAt?.toDate) {
          bookings.push({
            date: dayjs(item.createdAt.toDate()).format('YYYY-MM-DD')
          });
        }
      });

      const countPerDay = {};
      bookings.forEach(b => {
        countPerDay[b.date] = (countPerDay[b.date] || 0) + 1;
      });

      const result = Object.keys(countPerDay).map(date => ({
        date,
        count: countPerDay[date]
      }));

      setData(result);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Bookings Over Time</h2>
      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#7B61FF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
