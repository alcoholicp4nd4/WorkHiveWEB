// src/pages/AdminUserDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';

export default function AdminUserDetails() {
  const { userId } = useParams();
  const [services, setServices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchAllDetails();
  }, []);

  const fetchAllDetails = async () => {
    const servicesQuery = query(collection(db, 'services'), where('userId', '==', userId));
    const servicesSnap = await getDocs(servicesQuery);
    setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', userId));
    const favoritesSnap = await getDocs(favoritesQuery);
    setFavorites(favoritesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const ratingsQuery = query(collection(db, 'ratings'), where('receiverId', '==', userId));
    const ratingsSnap = await getDocs(ratingsQuery);
    setRatings(ratingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const reportsQuery = query(collection(db, 'reports'), where('providerId', '==', userId));
    const reportsSnap = await getDocs(reportsQuery);
    setReports(reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const convQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', userId));
    const convSnap = await getDocs(convQuery);
    setConversations(convSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const sectionStyle = { marginBottom: 20 };
  const itemStyle = { marginLeft: 20 };

  return (
    <div style={{ padding: 20 }}>
      <h2>User Details Page</h2>
      <p><strong>User ID:</strong> {userId}</p>

      <div style={sectionStyle}>
        <h3>Services</h3>
        {services.length > 0 ? (
          services.map(service => (
            <div key={service.id} style={itemStyle}>
              <p><strong>Title:</strong> {service.title}</p>
              <p><strong>Description:</strong> {service.description}</p>
              <p><strong>Category:</strong> {service.category}</p>
              <p><strong>Price:</strong> {service.price} ({service.priceType})</p>
              <p><strong>Delivery:</strong> {service.deliveryTime}</p>
              <hr />
            </div>
          ))
        ) : <p>No services.</p>}
      </div>

      <div style={sectionStyle}>
        <h3>Favorites</h3>
        {favorites.length > 0 ? (
          favorites.map(fav => (
            <div key={fav.id} style={itemStyle}>
              <p><strong>Service ID:</strong> {fav.serviceId}</p>
              <hr />
            </div>
          ))
        ) : <p>No favorites.</p>}
      </div>

      <div style={sectionStyle}>
        <h3>Ratings</h3>
        {ratings.length > 0 ? (
          ratings.map(rating => (
            <div key={rating.id} style={itemStyle}>
              <p><strong>From:</strong> {rating.senderId}</p>
              <p><strong>Score:</strong> {rating.score}</p>
              <p><strong>Comment:</strong> {rating.comment}</p>
              <hr />
            </div>
          ))
        ) : <p>No ratings.</p>}
      </div>

      <div style={sectionStyle}>
        <h3>Reports</h3>
        {reports.length > 0 ? (
          reports.map(report => (
            <div key={report.id} style={itemStyle}>
              <p><strong>Issue:</strong> {report.issueType}</p>
              <p><strong>Details:</strong> {report.issueDetails}</p>
              <p><strong>Status:</strong> {report.status}</p>
              <hr />
            </div>
          ))
        ) : <p>No reports.</p>}
      </div>

      <div style={sectionStyle}>
        <h3>Conversations</h3>
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <div key={conv.id} style={itemStyle}>
              <p><strong>Participants:</strong> {conv.participants.join(', ')}</p>
              <hr />
            </div>
          ))
        ) : <p>No conversations.</p>}
      </div>
    </div>
  );
}
