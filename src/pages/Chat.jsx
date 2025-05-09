import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs, // Keep getDocs as it's used initially if needed, or remove if only using snapshot
  onSnapshot, // Keep onSnapshot
  doc,
  Timestamp // Import Timestamp if needed for sorting comparison
} from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getCurrentUser } from '../database/authDatabase';

const FALLBACK_PROFILE_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function Chat() {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Use a ref to store message listener unsubscribes to manage cleanup
  const messageListenersRef = useRef({});

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if unmounted

    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (isMounted) {
        setCurrentUser(user);
        if (!user) {
          setLoading(false); // Stop loading if no user
        }
      }
    };

    fetchUser();

    // Cleanup function for isMounted flag
    return () => {
      isMounted = false;
    };
  }, []); // Separate effect for fetching user

  useEffect(() => {
    if (!currentUser) return; // Don't run if user isn't loaded yet

    setLoading(true);
    const conversationQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
      // You might want to order conversations by a 'lastUpdated' field if you add one
      // orderBy('lastUpdated', 'desc')
    );

    const unsubscribeConversations = onSnapshot(conversationQuery, (convSnapshot) => {
      const currentConvIds = new Set(convSnapshot.docs.map(d => d.id));
      Object.keys(messageListenersRef.current).forEach(convId => {
        if (!currentConvIds.has(convId)) {
          messageListenersRef.current[convId](); 
          delete messageListenersRef.current[convId];
        }
      });

      if (convSnapshot.empty) {
        setChatList([]);
        setLoading(false);
        return;
      }

      let initialChatList = convSnapshot.docs.map(convDoc => ({
        chatId: convDoc.id,
        convData: convDoc.data(), // Store convData temporarily
        partner: null,
        lastMessage: null,
      }));

      let partnerFetchPromises = initialChatList.map(item => {
        const partnerId = item.convData.participants?.find(id => id !== currentUser.uid);
        if (!partnerId) {
          console.warn(`Conversation ${item.chatId} missing partner ID.`);
          return Promise.resolve(null); // Resolve with null if no partnerId
        }
        const partnerDocRef = doc(db, 'users', partnerId);
        return getDoc(partnerDocRef).then(partnerDocSnap => {
          if (partnerDocSnap.exists()) {
            return { ...item, partner: { id: partnerDocSnap.id, ...partnerDocSnap.data() } };
          } else {
            console.warn(`Partner user document not found for ID: ${partnerId}. Chat ${item.chatId} will be filtered out.`);
            return null; // Mark for filtering
          }
        }).catch(error => {
          console.error(`Error fetching partner ${partnerId} for chat ${item.chatId}:`, error);
          return null; // Mark for filtering on error
        });
      });

      Promise.all(partnerFetchPromises).then(resolvedChatItems => {
        const validChatItems = resolvedChatItems.filter(item => item && item.partner);
        setChatList(validChatItems); // Set initial list with partner data (or filtered)

        validChatItems.forEach(chatItem => {
          const { chatId } = chatItem;
          const messagesRef = collection(db, 'conversations', chatId, 'messages');
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          
          if (messageListenersRef.current[chatId]) {
            messageListenersRef.current[chatId](); // Unsubscribe previous listener if any
          }

          messageListenersRef.current[chatId] = onSnapshot(messagesQuery, (messageSnapshot) => {
            let lastMessageData = null;
            if (!messageSnapshot.empty) {
              const msgData = messageSnapshot.docs[0].data();
              lastMessageData = {
                text: msgData.text,
                senderId: msgData.senderId,
                timestamp: msgData.timestamp,
              };
            }
            setChatList(prevList =>
              prevList.map(item =>
                item.chatId === chatId ? { ...item, lastMessage: lastMessageData } : item
              ).sort((a, b) => { 
                const timeA = a.lastMessage?.timestamp?.toDate()?.getTime() || 0;
                const timeB = b.lastMessage?.timestamp?.toDate()?.getTime() || 0;
                return timeB - timeA;
              })
            );
          }, (error) => {
            console.error(`Error fetching last message for chat ${chatId}:`, error);
          });
        });
        if (loading) setLoading(false); // Set loading to false after all initial setup
      });

    }, (error) => {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      setChatList([]);
    });

    // Cleanup function for the main conversation listener and all active message listeners
    return () => {
      unsubscribeConversations();
      Object.values(messageListenersRef.current).forEach(unsubscribe => unsubscribe());
      messageListenersRef.current = {};
    };
  }, [currentUser]); // Rerun when currentUser is loaded

  const handleChatClick = (partnerId) => {
    if (currentUser && partnerId) {
      navigate(`/chatscreen/${currentUser.uid}/${partnerId}`);
    } else {
        console.error("Cannot navigate to chat: missing user or partner ID");
    }
  };

  if (loading) return <div className="text-center py-10">Loading chats...</div>;

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Chats</h1>
        {chatList.length === 0 ? (
          <p className="text-gray-600">No active chats found.</p> // Updated message
        ) : (
          <div className="space-y-4">
            {/* Render chat list - ensure partner data is loaded before accessing properties */}
            {chatList.map((chatItem) => (
              chatItem.partner ? ( // Render only if partner data is loaded
                <div
                  key={chatItem.chatId}
                  onClick={() => handleChatClick(chatItem.partner.id)}
                  className="cursor-pointer flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={chatItem.partner.profileImage || FALLBACK_PROFILE_IMAGE_URL}
                    alt={chatItem.partner.username || 'User'}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={(e) => { 
                      if (e.target.src !== FALLBACK_PROFILE_IMAGE_URL) {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_PROFILE_IMAGE_URL;
                      }
                    }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{chatItem.partner.username || 'User'}</h2>
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
              ) : ( // Optional: Render a placeholder while partner details load
                <div key={chatItem.chatId} className="p-4 bg-white rounded-xl shadow-sm opacity-50">
                    Loading chat details...
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
