import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
    fetchUsers();
  }, []);

  const fetchReports = async () => {
    const snapshot = await getDocs(collection(db, 'reports'));
    const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReports(fetchedReports);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const usersMap = {};
    snapshot.forEach(doc => {
      usersMap[doc.id] = doc.data().username || 'Unknown';
    });
    setUsers(usersMap);
  };

  const banProvider = async (providerId) => {
    const userRef = doc(db, 'users', providerId);
    await updateDoc(userRef, { banned: true });
    alert('✅ Provider banned');
  };

  const cancelReport = async (reportId) => {
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
    alert('❌ Report deleted');
    fetchReports();
  };

  const reportCounts = reports.reduce((acc, report) => {
    acc[report.providerId] = (acc[report.providerId] || 0) + 1;
    return acc;
  }, {});

  const filteredReports = reports.filter((report) => {
    const reporter = users[report.reporterId] || 'Unknown User';
    const provider = users[report.providerId] || 'Unknown User';
    const combined = `${reporter} ${provider} ${report.issueType || ''} ${report.status || ''}`;
    return combined.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">User Reports</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded-md text-sm"
        />
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-gray-500">No reports available.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 shadow rounded-xl p-4">
              <h3 className="font-medium text-lg mb-2 text-indigo-700">Issue: {report.issueType}</h3>
              <p><strong>Reporter:</strong> {users[report.reporterId] || 'Unknown User'}</p>
              <p><strong>Provider:</strong> {users[report.providerId] || report.providerId}</p>
              <p><strong>Service ID:</strong> {report.serviceId}</p>
              <p><strong>Booking ID:</strong> {report.bookingId}</p>
              <p><strong>Description:</strong> {report.description}</p>
              <p><strong>Details:</strong> {report.issueDetails}</p>
              <p><strong>Status:</strong> {report.status}</p>
              <p className="text-sm text-gray-600"><strong>Total Reports Against Provider:</strong> {reportCounts[report.providerId]}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => banProvider(report.providerId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-md"
                >
                  Ban Provider
                </button>
                <button
                  onClick={() => cancelReport(report.id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-md"
                >
                  Cancel Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
