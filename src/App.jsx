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
              path="/serviceDetails"
              element={
                <PrivateRoute>
                  <ServiceDetailsScreen />
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;