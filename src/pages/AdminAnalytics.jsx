import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export default function AdminAnalytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [topProvidersData, setTopProvidersData] = useState([]);
  const [reportStats, setReportStats] = useState([]);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchAllStats = async () => {
      const servicesSnap = await getDocs(collection(db, 'services'));
      const reportsSnap = await getDocs(collection(db, 'reports'));
      const usersSnap = await getDocs(collection(db, 'users'));

      const categoryCounts = {};
      const providerCounts = {};
      const reportCounts = {};
      const map = {};

      // Build user map from uid and doc.id → username
      usersSnap.forEach(doc => {
        const user = doc.data();
        map[doc.id] = user.username || 'Unknown';
        if (user.uid) map[user.uid] = user.username || 'Unknown';
      });
      setUserMap(map);

      // Count services per category & provider
      servicesSnap.forEach(doc => {
        const { category, userId } = doc.data();
        if (category) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        if (userId) providerCounts[userId] = (providerCounts[userId] || 0) + 1;
      });

      // Count reports per provider
      reportsSnap.forEach(doc => {
        const { providerId } = doc.data();
        if (providerId) reportCounts[providerId] = (reportCounts[providerId] || 0) + 1;
      });

      setCategoryData(Object.entries(categoryCounts).map(([name, value]) => ({ name, value })));
      setTopProvidersData(Object.entries(providerCounts).map(([uid, value]) => ({
        name: map[uid] || uid,
        value
      })));
      setReportStats(Object.entries(reportCounts).map(([uid, value]) => ({
        name: map[uid] || uid,
        value
      })));
    };

    fetchAllStats();
  }, []);

  const chartStyle = { marginTop: 40 };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Analytics</h2>
      <p>Overview of service category popularity</p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Category Count" />
        </BarChart>
      </ResponsiveContainer>

      <h3 style={chartStyle}>Top Providers (by number of services)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topProvidersData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#82ca9d" name="Services per Provider" />
        </BarChart>
      </ResponsiveContainer>

      <h3 style={chartStyle}>Most Reported Users</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={reportStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#f87171" name="Reports Received" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
