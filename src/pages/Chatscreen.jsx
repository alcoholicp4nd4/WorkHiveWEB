import React, { useState, useEffect } from 'react';
import { db } from '../database/firebaseConfig';
import { useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

export default function ChatScreen() {
  const { currentUserId, providerId } = useParams(); // ✅ Get from URL like /chat/:currentUserId/:providerId
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const conversationId = [currentUserId, providerId].sort().join('_');
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  useEffect(() => {
    const loadMessages = async () => {
      const conversationDoc = doc(db, 'conversations', conversationId);
      const exists = await getDoc(conversationDoc);
      if (!exists.exists()) {
        await setDoc(conversationDoc, {
          participants: [currentUserId, providerId],
          createdAt: new Date()
        });
      }
    };

    loadMessages();

    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await addDoc(messagesRef, {
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: new Date()
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-purple-100 p-4">
      <div className="flex-1 overflow-y-auto">
        {messages.map((item) => (
          <div key={item.id} className={`p-2 my-1 rounded-lg max-w-xs ${item.senderId === currentUserId ? 'bg-purple-400 self-end' : 'bg-yellow-400 self-start'}`}>
            <p className="text-purple-900">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center border-t border-purple-400 p-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-purple-400 rounded-full px-4 py-2 mr-2 bg-white"
          placeholder="Type a message..."
        />
        <button className="bg-green-500 text-white rounded-lg px-4 py-2" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}