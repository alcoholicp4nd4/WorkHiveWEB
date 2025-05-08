import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';

export default function AdminUserDetails() {
  const { userId } = useParams();
  const [services, setServices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});
  const [allServices, setAllServices] = useState([]); // include all for lookup

  useEffect(() => {
    fetchAllDetails();
  }, []);

  const fetchAllDetails = async () => {
    // Build user map with both doc ID and UID
    const usersSnap = await getDocs(collection(db, 'users'));
    const userMapTemp = {};
    usersSnap.forEach(doc => {
      const data = doc.data();
      userMapTemp[doc.id] = data.username || 'Unknown'; // Firestore doc ID
      if (data.uid) {
        userMapTemp[data.uid] = data.username || 'Unknown'; // Firebase auth UID
      }
    });
    setUserMap(userMapTemp);

    // Get all services and build serviceMap
    const servicesSnap = await getDocs(collection(db, 'services'));
    const serviceMapTemp = {};
    const relatedServices = [];
    const allServiceObjs = [];

    servicesSnap.forEach(doc => {
      const data = doc.data();
      const serviceObj = { id: doc.id, ...data };
      allServiceObjs.push(serviceObj);
      serviceMapTemp[doc.id] = data.title || 'Unknown Service';
      if (data.userId === userId) relatedServices.push(serviceObj);
    });

    setServiceMap(serviceMapTemp);
    setServices(relatedServices);
    setAllServices(allServiceObjs); // needed to lookup provider of any rated service

    const favoritesSnap = await getDocs(query(collection(db, 'favorites'), where('userId', '==', userId)));
    setFavorites(favoritesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const ratingsSnap = await getDocs(query(collection(db, 'ratings'), where('userId', '==', userId)));
    setRatings(ratingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const reportsSnap = await getDocs(query(collection(db, 'reports'), where('providerId', '==', userId)));
    setReports(reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const convSnap = await getDocs(query(collection(db, 'conversations'), where('participants', 'array-contains', userId)));
    setConversations(convSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const banUser = async () => {
    await updateDoc(doc(db, 'users', userId), { banned: true });
    alert('User has been banned.');
  };

  const sectionStyle = { marginBottom: 20 };
  const itemStyle = { marginLeft: 20 };

  return (
    <div style={{ padding: 20 }}>
      <h2>User Details Page</h2>
      <p><strong>User ID:</strong> {userId}</p>
      <button onClick={banUser} style={{ marginBottom: 20, background: '#dc2626', color: 'white', padding: 10, border: 'none', borderRadius: 5 }}>Ban User</button>

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
              <p><strong>Service:</strong> {serviceMap[fav.serviceId] || fav.serviceId}</p>
              <hr />
            </div>
          ))
        ) : <p>No favorites.</p>}
      </div>

      <div style={sectionStyle}>
        <h3>Ratings</h3>
        {ratings.length > 0 ? (
          ratings.map(rating => {
            const serviceTitle = serviceMap[rating.serviceId] || 'Unknown service';
            const fullService = allServices.find(s => s.id === rating.serviceId);
            const providerName = fullService ? (userMap[fullService.userId] || fullService.userId) : 'Unknown';
            return (
              <div key={rating.id} style={itemStyle}>
                <p><strong>Service:</strong> {serviceTitle} (by {providerName})</p>
                <p><strong>Score:</strong> {rating.rating}</p>
                <hr />
              </div>
            );
          })
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
              <p><strong>Participants:</strong> {conv.participants.map(pid => userMap[pid] || 'Deleted User').join(', ')}</p>
              <hr />
            </div>
          ))
        ) : <p>No conversations.</p>}
      </div>
    </div>
  );
}
