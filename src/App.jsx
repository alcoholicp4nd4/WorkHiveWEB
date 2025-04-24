import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Favorites from './pages/Favorites';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ServiceDetailsScreen from './pages/ServiceDetailsScreen';
import ChatScreen from './pages/Chatscreen';
import AddServiceScreen from './pages/AddServiceScreen';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUserDetails from './pages/AdminUserDetails';
import ProviderBookingsScreen from './pages/ProviderBookingScreen'; 

const AdminRoute = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem('loggedInUser'));
  return userData?.role === 'admin' ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative">
          <AnimatedBackground />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search/:Category" element={<Search />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <Favorites />
                </PrivateRoute>
              }
            />
            <Route
              path="/chatscreen/:currentUserId/:providerId"
              element={
                <PrivateRoute>
                  <ChatScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/serviceDetails/:serviceId"
              element={
                <PrivateRoute>
                  <ServiceDetailsScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/ProviderBookingScreen/:providerId"
              element={
                <PrivateRoute>
                  <ProviderBookingsScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/addservice"
              element={
                <PrivateRoute>
                  <AddServiceScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </PrivateRoute>
              }
            />
            <Route
  path="/admin-reports"
  element={
    <PrivateRoute>
      <AdminRoute>
        <AdminReports />
      </AdminRoute>
    </PrivateRoute>
  }
/>
<Route
  path="/admin-analytics"
  element={
    <PrivateRoute>
      <AdminRoute>
      <AdminAnalytics />
      </AdminRoute>
    </PrivateRoute>
  }
/>
<Route
  path="/admin-user/:userId"
  element={
    <PrivateRoute>
      <AdminRoute>
        <AdminUserDetails />
      </AdminRoute>
    </PrivateRoute>
  }
/>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;