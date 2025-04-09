import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase auth methods

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Firebase auth instance

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as any); // Type assertion to fix type mismatch
      setLoading(false); // Set loading to false once the auth state is checked
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>; // Display loading while checking auth state
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if no user is authenticated
  }

  return <>{children}</>; // Render the children components if the user is authenticated
}
