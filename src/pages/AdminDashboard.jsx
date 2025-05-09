import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../database/firebaseConfig';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(userList);
  };

  const updateUserRole = async (userId, newRole, newProviderStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      isProvider: newProviderStatus,
    });
    fetchUsers();
  };

  const deleteUser = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    fetchUsers();
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const providerCount = users.filter(u => u.isProvider).length;
  const userCount = users.length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <Link to="/admin-reports" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">Reports</Link>
          <Link to="/admin-analytics" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm">Analytics</Link>
        </div>

        <div className="text-right space-y-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-64"
          />
          <div className="text-sm text-gray-700"><strong>Users:</strong> {userCount}</div>
          <div className="text-sm text-gray-700"><strong>Providers:</strong> {providerCount}</div>
        </div>
      </div>

      <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white shadow border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-700 mt-1">Role: <span className="font-medium">{user.role || 'user'}</span></p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateUserRole(user.id, 'admin', user.isProvider)}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 text-sm rounded-md"
                >
                  Make Admin
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm rounded-md"
                >
                  Delete
                </button>
                <Link to={`/admin-user/${user.id}`}>
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 text-sm rounded-md">
                    Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
