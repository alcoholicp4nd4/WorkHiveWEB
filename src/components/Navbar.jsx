import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-pink-500">
              ServiceMarket
            </Link>

            <div className="hidden sm:flex space-x-6 text-gray-300">
              <Link
                to="/"
                className="hover:underline hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/search/NULL"
                className="hover:underline hover:text-white transition-colors"
              >
                Search
              </Link>
              {user && (
                <>
                  <Link
                    to="/favorites"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/chat"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Chat
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
