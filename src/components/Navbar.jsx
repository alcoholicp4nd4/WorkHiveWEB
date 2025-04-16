import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut, getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth(); // ✅ Get full user from context (includes .role)
  const location = useLocation(); // Needed for path highlighting
  const auth = getAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("loggedInUser");
      window.location.href = "/login"; // hard reload to reset context
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-pink-500">WorkHive</Link>

            <div className="hidden sm:flex space-x-6 text-gray-300">
              <Link to="/" className="hover:underline hover:text-white transition-colors">Home</Link>
              <Link to="/search/NULL" className="hover:underline hover:text-white transition-colors">Search</Link>

              {user && (
                <>
                  <Link to="/favorites" className="hover:underline hover:text-white transition-colors">Favorites</Link>
                  <Link to="/chat" className="hover:underline hover:text-white transition-colors">Chat</Link>

                  {/* ✅ Admin link only for admin */}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className={`${location.pathname === '/admin-dashboard' ? 'text-pink-400 font-bold' : 'text-white'} px-4 py-2 hover:text-pink-300`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side Auth buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
                <button
                  onClick={handleSignOut}
                  className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="bg-pink-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
