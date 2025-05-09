import React, { useState, useEffect } from 'react';
import { db } from '../database/firebaseConfig';
import { useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where // Added where
} from 'firebase/firestore';

export default function ChatScreen() {
  const { currentUserId, providerId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserName, setOtherUserName] = useState('');

  // This conversationId will be used as the chatId value for querying the top-level 'messages' collection
  const conversationId = [currentUserId, providerId].sort().join('_');
  
  // Reference to the top-level 'messages' collection for sending new messages
  // For querying, we'll build it within the useEffect
  const messagesCollectionRef = collection(db, 'messages'); 

  useEffect(() => {
    // The loadMessages function that created a document in 'conversations' collection is removed,
    // as we are now fetching from a top-level 'messages' collection using a 'chatId' field.

    const q = query(
      collection(db, 'messages'), // Query the top-level 'messages' collection
      where('chatId', '==', conversationId), // Filter by the generated conversationId (acting as chatId)
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [conversationId]); // Depend on conversationId

  useEffect(() => {
    const fetchOtherUserName = async () => {
      console.log("[ChatScreen] Attempting to fetch username for providerId:", providerId);
      if (providerId) {
        const userDocRef = doc(db, 'users', providerId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          console.log("[ChatScreen] User document data:", userDoc.data()); // Log user data
          setOtherUserName(userDoc.data().username || "Service Provider");
        } else {
          console.log("[ChatScreen] User document not found for providerId:", providerId); // Log if not found
          setOtherUserName("Service Provider (User not found)");
        }
      } else {
        console.log("[ChatScreen] providerId is missing."); // Log if providerId is missing
        setOtherUserName("Service Provider");
      }
    };

    fetchOtherUserName();
  }, [providerId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId) return;
    await addDoc(messagesCollectionRef, { // Use messagesCollectionRef for adding new messages
      chatId: conversationId, // Ensure new messages also get the chatId
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: new Date() // Using client-side new Date() for simplicity, consider serverTimestamp()
      // receiverId: providerId, // Optional: if you need to explicitly store the receiver
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-purple-100 p-4">
      <div className="flex items-center mb-4 bg-white p-2 rounded-lg shadow">
        <div className="flex items-center">
          {/* Consider fetching actual online status if needed */}
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> 
          <h2 className="text-lg font-bold">{otherUserName}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 p-2"> {/* Added space-y and padding */}
        {messages.map((item) => (
          <div 
            key={item.id} 
            className={`flex ${item.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`p-3 my-1 rounded-lg max-w-[70%] break-words ${item.senderId === currentUserId ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p>{item.text}</p>
              {/* Optional: Display timestamp */}
              {/* <p className={`text-xs mt-1 ${item.senderId === currentUserId ? 'text-purple-200' : 'text-gray-500'}`}>{item.timestamp?.toDate().toLocaleTimeString()}</p> */}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center border-t border-purple-300 p-2 bg-white mt-2 rounded-lg shadow"> {/* Styled input area */}
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send on Enter key press
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Type a message..."
        />
        <button 
          className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400" 
          onClick={handleSend}
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