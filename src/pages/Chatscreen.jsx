import React, { useState, useEffect } from 'react';
import { db } from '../database/firebaseConfig';
import { useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

export default function ChatScreen() {
  const { currentUserId, providerId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserName, setOtherUserName] = useState('');

  useEffect(() => {
    if (!currentUserId || !providerId) {
        console.log("ChatScreen: currentUserId or providerId is missing.");
        return;
    }

    const conversationId = [currentUserId, providerId].sort().join('_');
    const conversationDocRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    let unsubscribe;

    const loadMessagesAndConversation = async () => {
      try {
        const exists = await getDoc(conversationDocRef);
        if (!exists.exists()) {
          await setDoc(conversationDocRef, {
            participants: [currentUserId, providerId],
            createdAt: new Date(),
            lastUpdated: new Date(),
          });
          console.log(`Conversation document created for ${conversationId}`);
        } else {
          // Optionally update lastUpdated if conversation already exists
          // await setDoc(conversationDocRef, { lastUpdated: new Date() }, { merge: true });
        }

        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(fetched);
        }, (error) => {
          console.error("Error fetching messages:", error);
        });

      } catch (error) {
        console.error("Error in loadMessagesAndConversation:", error);
      }
    };

    loadMessagesAndConversation();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUserId, providerId]);

  useEffect(() => {
    if (!providerId) return;

    const fetchOtherUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', providerId));
        if (userDoc.exists()) {
          setOtherUserName(userDoc.data().username || "Service Provider");
        } else {
          setOtherUserName("Service Provider (Not Found)");
        }
      } catch (error) {
        console.error("Error fetching other user's name:", error);
        setOtherUserName("Service Provider (Error)");
      }
    };

    fetchOtherUserName();
  }, [providerId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId || !providerId) return;
    const conversationId = [currentUserId, providerId].sort().join('_');
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    // const conversationDocRef = doc(db, 'conversations', conversationId); // For updating lastUpdated

    try {
      await addDoc(messagesRef, {
        senderId: currentUserId,
        text: newMessage.trim(),
        timestamp: new Date() // Consider serverTimestamp() for production
      });
      setNewMessage('');
      // Optionally update the lastUpdated field on the parent conversation document
      // await setDoc(conversationDocRef, { lastUpdated: new Date() }, { merge: true });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* Back button can be added here if needed */}
        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-semibold mr-3">
          {otherUserName.charAt(0).toUpperCase() || 'P'} {/* Placeholder initial */}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{otherUserName}</h2>
          {/* <p className="text-xs text-green-500">Online</p> */}{/* Online status - future enhancement */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((item) => (
          <div 
            key={item.id} 
            className={`flex ${item.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`py-2 px-4 my-1 rounded-2xl max-w-[70%] break-words shadow ${item.senderId === currentUserId ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
              <p>{item.text}</p>
              {/* Optional: Timestamp display */}
              {item.timestamp && (
                <p className={`text-xs mt-1 text-right ${item.senderId === currentUserId ? 'text-purple-200' : 'text-gray-500'}`}>
                  {new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center p-3 bg-white border-t border-gray-200">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send on Enter
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Type a message..."
        />
        <button 
          className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
          onClick={handleSend}
          disabled={!newMessage.trim()} // Disable button if input is empty
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3.105 3.105a1.5 1.5 0 012.121-.001L19.415 11.5a1.5 1.5 0 010 2.121L5.226 19.01A1.5 1.5 0 013.105 17.91l.001-14.804z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
