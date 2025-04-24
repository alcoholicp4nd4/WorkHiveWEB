import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function AdminAnalytics() {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      const snapshot = await getDocs(collection(db, 'services'));
      const categoryCounts = {};

      snapshot.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      const chartData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
      setCategoryData(chartData);
    };

    fetchCategoryStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Analytics</h2>
      <p>Overview of service category popularity</p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
