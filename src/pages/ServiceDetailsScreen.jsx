import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../database/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
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
        setError("Failed to load service details.");
        console.error(err);
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

    if (!service || !service.userId) {
      toast.error("Service data incomplete.");
      return;
    }

    if (currentUser.uid === service.userId) {
      toast.error("You can't book your own service.");
      return;
    }

    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("serviceId", "==", serviceId),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingBooking = querySnapshot.docs[0].data();
        if (existingBooking.status !== 'completed') {
          toast.error("You have an active or pending booking for this service.");
          return;
        }
      }

      const newBooking = {
        serviceId,
        userId: currentUser.uid,
        providerId: service.userId,
        serviceTitle: service.title,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const bookingDocRef = await addDoc(bookingsRef, newBooking);
      toast.success("Service booked successfully!");

      const participantIds = [currentUser.uid, service.userId].sort();
      const conversationId = participantIds.join("_");

      const conversationRef = doc(db, "conversations", conversationId);
      const conversationSnap = await getDoc(conversationRef);
      if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
          participants: participantIds,
          createdAt: serverTimestamp(),
        });
      }

      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        chatId: conversationId,
        senderId: currentUser.uid,
        receiverId: service.userId,
        text: `Hi ${ownerName}, I've just booked your service: "${service.title}". Looking forward to it! Booking ID: ${bookingDocRef.id}`,
        timestamp: serverTimestamp(),
        read: false,
      });

    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Booking failed. Please try again.");
    }
  };

  const handleChat = async () => {
    if (!currentUser || !service?.userId) return;

    try {
      const participantIds = [currentUser.uid, service.userId].sort();
      const conversationId = participantIds.join("_");

      const conversationRef = doc(db, "conversations", conversationId);
      const conversationSnap = await getDoc(conversationRef);
      if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
          participants: participantIds,
          createdAt: serverTimestamp(),
        });
      }

      navigate(`/chatscreen/${currentUser.uid}/${service.userId}`);
    } catch (err) {
      console.error("Chat init failed:", err);
      toast.error("Could not open chat.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="loading-spinner"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-600 py-10 animate-fadeIn">
      {error}
    </div>
  );
  
  if (!service) return (
    <div className="text-center text-gray-500 py-10 animate-fadeIn">
      No service data available.
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8 animate-fadeIn">
      <div className="max-w-4xl w-full p-6 bg-white rounded-xl shadow-lg mx-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:text-blue-700 mb-4 flex items-center transition-colors duration-200 animate-fadeIn"
        >
          <span className="mr-2">←</span> Back
        </button>

        {service.images?.length > 0 && (
          <div className="rounded-xl overflow-hidden shadow-lg animate-fadeIn animation-delay-200">
            <Carousel
              showThumbs={false}
              className="rounded-xl overflow-hidden"
              showStatus={false}
              infiniteLoop={true}
              autoPlay={true}
              interval={5000}
            >
              {service.images.map((url, index) => (
                <div key={index} className="relative aspect-w-16 aspect-h-9">
                  <img
                    src={url}
                    alt={`Service ${index + 1}`}
                    className="object-cover w-full h-[400px]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        )}

        <div className="mt-6 animate-fadeIn animation-delay-400">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{service.title}</h1>
          <p className="text-gray-500 italic mb-2">Offered by: {ownerName}</p>
          <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
          <p className="text-lg text-gray-700 font-semibold mb-4">
            Price:{" "}
            <span className="text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(service.price || 0)}
            </span>
          </p>

          {currentUser && currentUser.uid !== service.userId && (
            <div className="flex flex-wrap gap-4 mb-6 animate-fadeIn animation-delay-600">
              <button
                onClick={handleBookService}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                Book Service
              </button>

              <button
                onClick={handleChat}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
              >
                Chat with Provider
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-6 animate-fadeIn animation-delay-800">
            <ServiceRating serviceId={serviceId} />
            {currentUser && (
              <div className="transform hover:scale-110 transition-transform duration-200">
                <FavoriteButton serviceId={serviceId} userId={currentUser.uid} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailsScreen;