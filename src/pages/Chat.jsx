import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  documentId
} from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getCurrentUser } from '../database/authDatabase'; // Ensure this is implemented

export default function Chat() {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]); // Renamed from providers for clarity
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndChatsWithBookedProviders = async () => {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setLoading(false);
        console.log("No current user found for fetching chats.");
        setChatList([]); // Ensure chat list is empty
        return;
      }

      try {
        // 1. Fetch Current User's Bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
          // Optionally, add status filter: e.g., where('status', '==', 'active')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        if (bookingsSnapshot.empty) {
          console.log("No bookings found for the current user.");
          setChatList([]);
          setLoading(false);
          return;
        }

        const serviceIds = [...new Set(bookingsSnapshot.docs.map(bDoc => bDoc.data().serviceId))];
        if (serviceIds.length === 0) {
            console.log("No service IDs found in bookings.");
            setChatList([]);
            setLoading(false);
            return;
        }
        
        // 2. Get Service Details & Provider IDs
        // Fetch details for each service to get the provider's userId
        const serviceDocsPromises = serviceIds.map(id => getDoc(doc(db, 'services', id)));
        const serviceDocsSnaps = await Promise.all(serviceDocsPromises);
        
        const providerUserIds = [
          ...new Set(
            serviceDocsSnaps
              .filter(snap => snap.exists() && snap.data().userId) // Ensure service exists and has a userId
              .map(snap => snap.data().userId)
              .filter(providerId => providerId !== user.uid) // Ensure provider is not the current user
          ),
        ];

        if (providerUserIds.length === 0) {
          console.log("No unique provider IDs found from services, or all providers are the current user.");
          setChatList([]);
          setLoading(false);
          return;
        }

        // 3. Fetch Provider User Details
        const MaxInQueryItems = 30; // Firestore 'in' query limit
        let bookedProvidersDetails = [];

        for (let i = 0; i < providerUserIds.length; i += MaxInQueryItems) {
            const batchIds = providerUserIds.slice(i, i + MaxInQueryItems);
            if (batchIds.length > 0) {
                 const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', batchIds));
                 const usersSnapshot = await getDocs(usersQuery);
                 usersSnapshot.docs.forEach(uDoc => {
                     bookedProvidersDetails.push({ id: uDoc.id, ...uDoc.data() });
                 });
            }
        }

        if (bookedProvidersDetails.length === 0) {
          console.log("No provider details found for the fetched IDs.");
          setChatList([]);
          setLoading(false);
          return;
        }
        
        // 4. Fetch Last Message for each booked provider
        const unsubscribes = [];
        setChatList([]); // Clear list before populating to handle potential re-runs or updates

        bookedProvidersDetails.forEach(partner => {
          const chatId = [user.uid, partner.id].sort().join('_');
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('timestamp', 'desc'),
            limit(1)
          );

          const unsubscribe = onSnapshot(messagesQuery, (messageSnapshot) => {
            let lastMessage = null;
            if (!messageSnapshot.empty) {
              const messageDoc = messageSnapshot.docs[0];
              lastMessage = {
                text: messageDoc.data().text,
                senderId: messageDoc.data().senderId,
                timestamp: messageDoc.data().timestamp,
              };
            }
            
            setChatList(prevChatList => {
              const existingChatIndex = prevChatList.findIndex(c => c.partner.id === partner.id);
              const updatedChat = { partner, lastMessage, chatId };
              if (existingChatIndex > -1) {
                const newList = [...prevChatList];
                newList[existingChatIndex] = updatedChat;
                // Sort here to maintain order as messages come in
                return newList.sort((a, b) => {
                  if (!a.lastMessage && !b.lastMessage) return 0;
                  if (!a.lastMessage) return 1;
                  if (!b.lastMessage) return -1;
                  return b.lastMessage.timestamp?.toDate() - a.lastMessage.timestamp?.toDate();
                });
              } else {
                const newList = [...prevChatList, updatedChat];
                // Sort here when adding new chat item
                return newList.sort((a, b) => {
                  if (!a.lastMessage && !b.lastMessage) return 0;
                  if (!a.lastMessage) return 1;
                  if (!b.lastMessage) return -1;
                  return b.lastMessage.timestamp?.toDate() - a.lastMessage.timestamp?.toDate();
                });
              }
            });
          }, (error) => {
            console.error(`Error fetching last message for chat ${chatId} with partner ${partner.id}:`, error);
          });
          unsubscribes.push(unsubscribe);
        });
        
        setLoading(false);
        // This return is for the async function itself, for its cleanup to be registered by useEffect
        return () => {
          unsubscribes.forEach(unsub => unsub());
        };

      } catch (error) {
        console.error("Error fetching chats with booked providers:", error);
        setChatList([]);
        setLoading(false);
      }
    };

    // Call the async function and let useEffect handle its returned cleanup function
    fetchUserAndChatsWithBookedProviders();
    
  }, []); // Effect runs once on mount

  const handleChatClick = (partnerId) => {
    if (currentUser) {
      navigate(`/chatscreen/${currentUser.uid}/${partnerId}`);
    }
  };

  if (loading && chatList.length === 0) {
    return <div className="text-center py-10">Loading chats...</div>;
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Chats</h1>

        {chatList.length === 0 && !loading ? (
          <p className="text-gray-600">No chats with booked providers found.</p>
        ) : (
          <div className="space-y-4">
            {chatList.map((chatItem) => (
              <div
                key={chatItem.partner.id}
                onClick={() => handleChatClick(chatItem.partner.id)}
                className="cursor-pointer flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                <img
                  src={chatItem.partner.profileImage || 'https://via.placeholder.com/50'} // Ensure field name matches your db
                  alt={`Profile of ${chatItem.partner.username || 'user'}`}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                  onError={(e) => {
                    if (e.target.src !== 'https://via.placeholder.com/50') {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/50';
                    }
                  }}
                />
                <div className="flex-1 overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">{chatItem.partner.username}</h2>
                  {chatItem.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate">
                      {chatItem.lastMessage.senderId === currentUser?.uid ? 'You: ' : ''}
                      {chatItem.lastMessage.text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No messages yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
