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

      usersSnap.forEach(doc => {
        const user = doc.data();
        map[doc.id] = user.username || 'Unknown';
        if (user.uid) map[user.uid] = user.username || 'Unknown';
      });
      setUserMap(map);

      servicesSnap.forEach(doc => {
        const { category, userId } = doc.data();
        if (category) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        if (userId) providerCounts[userId] = (providerCounts[userId] || 0) + 1;
      });

      reportsSnap.forEach(doc => {
        const { providerId } = doc.data();
        if (providerId) reportCounts[providerId] = (reportCounts[providerId] || 0) + 1;
      });

      setCategoryData(Object.entries(categoryCounts).map(([name, value]) => ({ name, value })));
      setTopProvidersData(Object.entries(providerCounts).map(([uid, value]) => ({ name: map[uid] || uid, value })));
      setReportStats(Object.entries(reportCounts).map(([uid, value]) => ({ name: map[uid] || uid, value })));
    };

    fetchAllStats();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Analytics</h2>
      <p className="text-sm text-gray-500 mb-8">Overview of service category popularity</p>

      <div className="bg-white p-4 rounded-2xl shadow mb-10">
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
      </div>

      <div className="bg-white p-4 rounded-2xl shadow mb-10">
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Top Providers</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProvidersData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#34d399" name="Services per Provider" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Most Reported Users</h3>
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
    </div>
  );
}