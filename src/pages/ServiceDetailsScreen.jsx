import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../database/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import FavoriteButton from "../components/FavoriteButton";
import ServiceRating from "../components/ServiceRating";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import toast from "react-hot-toast";

const ServiceDetailsScreen = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      console.log("Service ID:", serviceId);

      if (!serviceId) {
        setError("Invalid Service ID provided.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "services", serviceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const serviceData = { id: docSnap.id, ...docSnap.data() };
          setService(serviceData);

          // Fetch owner's name
          if (serviceData.userId) {
            const userRef = doc(db, "users", serviceData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setOwnerName(userSnap.data().username || "Service Provider");
            }
          }
        } else {
          setError("Service not found.");
        }
      } catch (err) {
        setError("Failed to load service details. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleBookService = async () => {
    if (!currentUser) {
      toast.error("Please log in to book a service.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (currentUser.uid === service?.userId) {
      toast.error("You can't book your own service.");
      return;
    }

    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("serviceId", "==", serviceId),
        where("userId", "==", currentUser.uid),
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("You have already booked this service.");
        return;
      }

      const newBooking = {
        serviceId,
        userId: currentUser.uid,
        status: "active",
        createdAt: serverTimestamp(),
      };
      await addDoc(bookingsRef, newBooking);
      toast.success("Service booked successfully! Check 'My Bookings' to track it.");
    } catch (err) {
      toast.error("Failed to book service. Please try again.");
      console.error("Booking error:", err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading service details...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;
  if (!service) return <div className="text-center text-gray-500 py-10">No service data available.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:text-blue-700 mb-4 underline"
      >
        &larr; Back
      </button>

      {service.images?.length > 0 && (
        <Carousel showThumbs={false} className="mb-6 rounded-xl overflow-hidden">
          {service.images.map((url, index) => (
            <div key={index}>
              <img src={url} alt={`Service ${index}`} className="object-cover h-64 w-full" />
            </div>
          ))}
        </Carousel>
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-2">{service.title}</h1>
      <p className="text-gray-500 italic mb-2">Offered by: {ownerName}</p>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <p className="text-lg text-gray-700 font-semibold mb-2">
        Price:{" "}
        <span className="text-green-600">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(service.price || 0)}
        </span>
      </p>

      {currentUser && currentUser.uid !== service.userId && (
        <button
          onClick={handleBookService}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition mb-4"
        >
          Book Service
        </button>
      )}

      {/* New Chat Button */}
      {currentUser && (
        <button
          onClick={() => navigate(`/chatscreen/${currentUser.uid}/${serviceId}`)}
          className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition mb-4"
        >
          Chat with Provider
        </button>
      )}

      <div className="flex items-center space-x-4">
        <ServiceRating serviceId={serviceId} />
        {currentUser && <FavoriteButton serviceId={serviceId} userId={currentUser.uid} />}
      </div>
    </div>
  );
};

export default ServiceDetailsScreen;
