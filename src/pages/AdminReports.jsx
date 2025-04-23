// src/pages/AdminReports.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const snapshot = await getDocs(collection(db, 'reports'));
    const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReports(fetchedReports);
    setLoading(false);
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

  // Count reports per provider
  const reportCounts = reports.reduce((acc, report) => {
    acc[report.providerId] = (acc[report.providerId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>User Reports</h2>
      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {reports.map((report) => (
            <div key={report.id} style={{ background: '#f1f5f9', padding: 15, borderRadius: 8 }}>
              <h3 style={{ marginBottom: 4 }}>Issue Type: {report.issueType}</h3>
              <p><strong>Provider ID:</strong> {report.providerId}</p>
              <p><strong>Service ID:</strong> {report.serviceId}</p>
              <p><strong>Booking ID:</strong> {report.bookingId}</p>
              <p><strong>Description:</strong> {report.description}</p>
              <p><strong>Details:</strong> {report.issueDetails}</p>
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Report Count for Provider:</strong> {reportCounts[report.providerId]}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => banProvider(report.providerId)}
                  style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: 5 }}
                >
                  Ban Provider
                </button>
                <button
                  onClick={() => cancelReport(report.id)}
                  style={{ backgroundColor: '#6b7280', color: 'white', padding: '8px 12px', borderRadius: 5 }}
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
