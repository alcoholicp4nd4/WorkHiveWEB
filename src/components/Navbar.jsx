import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut, getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/favicon.png'; // Import the logo

export default function Navbar() {
  const { user } = useAuth(); // ✅ Get full user from context (includes .role)
  const location = useLocation(); // Needed for path highlighting
  const auth = getAuth();

  const linkStyle = (path) =>
    `${location.pathname === path ? 'text-[#CB9DF0] font-bold' : 'text-black'} px-4 py-2 hover:text-[#CB9DF0]`;

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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo + Title Link */}
            <Link to="/" className="flex items-center text-xl font-bold text-[#CB9DF0]">
              <img src={logo} alt="WorkHive Logo" className="h-8 mr-2" />
              <span>WorkHive</span>
            </Link>

            <div className="hidden sm:flex space-x-2">
              <Link to="/" className={linkStyle('/')}>Home</Link>
              <Link to="/search/All" className={linkStyle('/search/All')}>Search</Link>

              {user && (
                <>
                  <Link to="/favorites" className={linkStyle('/favorites')}>Favorites</Link>
                  <Link to="/chat" className={linkStyle('/chat')}>Chat</Link>

                  {/* ✅ Admin link only for admin */}
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className={linkStyle('/admin-dashboard')}>Admin</Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side Auth buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className={linkStyle('/profile')}>Profile</Link>
                <button
                  onClick={handleSignOut}
                  className="bg-[#FFF9BF] text-black font-semibold px-4 py-2 rounded-md hover:bg-[#CB9DF0] hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkStyle('/login')}>Sign In</Link>
                <Link to="/register" className="bg-[#CB9DF0] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#FFF9BF] hover:text-black transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
