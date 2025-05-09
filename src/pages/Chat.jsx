import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  onSnapshot,
  doc
} from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getCurrentUser } from '../database/authDatabase';

export default function Chat() {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      const conversationQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      const conversationSnapshot = await getDocs(conversationQuery);
      const tempChatList = [];

      for (const docSnap of conversationSnapshot.docs) {
        const conversationId = docSnap.id;
        const participants = docSnap.data().participants.filter(id => id !== user.uid);
        if (participants.length === 0) continue;

        const partnerId = participants[0];
        const partnerDoc = await getDoc(doc(db, 'users', partnerId));
        if (!partnerDoc.exists()) continue;

        const partnerData = { id: partnerDoc.id, ...partnerDoc.data() };

        const messagesQuery = query(
          collection(db, 'messages'),
          where('chatId', '==', conversationId),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        const messageSnap = await getDocs(messagesQuery);
        let lastMessage = null;
        if (!messageSnap.empty) {
          const m = messageSnap.docs[0].data();
          lastMessage = {
            text: m.text,
            senderId: m.senderId,
            timestamp: m.timestamp,
          };
        }

        tempChatList.push({ partner: partnerData, lastMessage, chatId: conversationId });
      }

      tempChatList.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return b.lastMessage.timestamp?.toDate() - a.lastMessage.timestamp?.toDate();
      });

      setChatList(tempChatList);
      setLoading(false);
    };

    fetchConversations();
  }, []);

  const handleChatClick = (partnerId) => {
    if (currentUser) {
      navigate(`/chatscreen/${currentUser.uid}/${partnerId}`);
    }
  };

  if (loading) return <div className="text-center py-10">Loading chats...</div>;

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Chats</h1>
        {chatList.length === 0 ? (
          <p className="text-gray-600">No chats found.</p>
        ) : (
          <div className="space-y-4">
            {chatList.map((chatItem) => (
              <div
                key={chatItem.chatId}
                onClick={() => handleChatClick(chatItem.partner.id)}
                className="cursor-pointer flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                <img
                  src={chatItem.partner.profileImage || 'https://via.placeholder.com/50'}
                  alt={chatItem.partner.username || 'user'}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
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
