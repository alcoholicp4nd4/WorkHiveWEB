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
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    fetchAllDetails();
  }, []);

  const fetchAllDetails = async () => {
    const usersSnap = await getDocs(collection(db, 'users'));
    const userMapTemp = {};
    usersSnap.forEach(doc => {
      const data = doc.data();
      userMapTemp[doc.id] = data.username || 'Unknown';
      if (data.uid) userMapTemp[data.uid] = data.username || 'Unknown';
    });
    setUserMap(userMapTemp);

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
    setAllServices(allServiceObjs);

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

  const sectionStyle = "mb-8";
  const cardStyle = "bg-white border border-gray-200 shadow-md rounded-xl p-4";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">User Details</h2>
        <button
          onClick={banUser}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Ban User
        </button>
      </div>

      <div className={sectionStyle}>
        <h3 className="text-lg font-medium mb-3">Services</h3>
        {services.length > 0 ? (
          services.map(service => (
            <div key={service.id} className={cardStyle + " mb-4"}>
              <p><strong>Title:</strong> {service.title}</p>
              <p><strong>Description:</strong> {service.description}</p>
              <p><strong>Category:</strong> {service.category}</p>
              <p><strong>Price:</strong> {service.price} ({service.priceType})</p>
              <p><strong>Delivery:</strong> {service.deliveryTime}</p>
            </div>
          ))
        ) : <p className="text-gray-500">No services.</p>}
      </div>

      <div className={sectionStyle}>
        <h3 className="text-lg font-medium mb-3">Favorites</h3>
        {favorites.length > 0 ? (
          favorites.map(fav => (
            <div key={fav.id} className={cardStyle + " mb-2"}>
              <p><strong>Service:</strong> {serviceMap[fav.serviceId] || fav.serviceId}</p>
            </div>
          ))
        ) : <p className="text-gray-500">No favorites.</p>}
      </div>

      <div className={sectionStyle}>
        <h3 className="text-lg font-medium mb-3">Ratings</h3>
        {ratings.length > 0 ? (
          ratings.map(rating => {
            const serviceTitle = serviceMap[rating.serviceId] || 'Unknown service';
            const fullService = allServices.find(s => s.id === rating.serviceId);
            const providerName = fullService ? (userMap[fullService.userId] || fullService.userId) : 'Unknown';
            return (
              <div key={rating.id} className={cardStyle + " mb-2"}>
                <p><strong>Service:</strong> {serviceTitle} (by {providerName})</p>
                <p><strong>Score:</strong> {rating.rating}</p>
              </div>
            );
          })
        ) : <p className="text-gray-500">No ratings.</p>}
      </div>

      <div className={sectionStyle}>
        <h3 className="text-lg font-medium mb-3">Reports</h3>
        {reports.length > 0 ? (
          reports.map(report => (
            <div key={report.id} className={cardStyle + " mb-2"}>
              <p><strong>Issue:</strong> {report.issueType}</p>
              <p><strong>Details:</strong> {report.issueDetails}</p>
              <p><strong>Status:</strong> {report.status}</p>
            </div>
          ))
        ) : <p className="text-gray-500">No reports.</p>}
      </div>

      <div className={sectionStyle}>
        <h3 className="text-lg font-medium mb-3">Conversations</h3>
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <div key={conv.id} className={cardStyle + " mb-2"}>
              <p><strong>Participants:</strong> {conv.participants.map(pid => userMap[pid] || 'Deleted User').join(', ')}</p>
            </div>
          ))
        ) : <p className="text-gray-500">No conversations.</p>}
      </div>
    </div>
  );
}
