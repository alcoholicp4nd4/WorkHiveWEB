import { useEffect, useState } from "react";
import { db } from "../database/firebaseConfig";
import { getCurrentUser } from "../database/authDatabase";
import { collection, getDocs, query, where, orderBy, onSnapshot, documentId } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const headerImage = "https://img.freepik.com/photos-premium/homme-vetu-uniforme-tenant-cle_220873-20532.jpg?w=1060";
const fallbackServiceCardImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const fallbackProviderAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function Home() {
  const [servicesWithProviders, setServicesWithProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([ 
    { label: 'Tech', value: 'tech' },
    { label: 'Design', value: 'design' },
    { label: 'Business', value: 'business' },
    { label: 'Education', value: 'education' },
    { label: 'Wellness', value: 'wellness' },
    { label: 'Local', value: 'local' },
    { label: 'Others', value: 'others' },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServicesAndProviders = async () => {
      setLoading(true);
      const servicesQuery = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
      
      const unsubscribeServices = onSnapshot(servicesQuery, async (servicesSnapshot) => {
        const fetchedServices = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (fetchedServices.length === 0) {
          setServicesWithProviders([]);
          setLoading(false);
          return;
        }

        // Step 1: Fetch ratings for each service and calculate average
        const servicesWithRatingsPromises = fetchedServices.map(async (service) => {
          const ratingsQuery = query(collection(db, 'ratings'), where('serviceId', '==', service.id));
          try {
            const ratingSnapshot = await getDocs(ratingsQuery);
            let totalRating = 0;
            let ratingCount = 0;
            ratingSnapshot.forEach(doc => {
              const ratingValue = doc.data().rating; // Assuming 'rating' field in rating documents
              if (typeof ratingValue === 'number') {
                totalRating += ratingValue;
                ratingCount++;
              }
            });
            return {
              ...service,
              serviceAvgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
              serviceRatingCount: ratingCount,
            };
          } catch (error) {
            console.error(`Error fetching ratings for service ${service.id}:`, error);
            return { ...service, serviceAvgRating: 0, serviceRatingCount: 0 }; // Fallback
          }
        });

        const servicesWithRatings = await Promise.all(servicesWithRatingsPromises);

        // Step 2: Fetch provider details
        const providerIds = [...new Set(servicesWithRatings.map(s => s.userId).filter(id => id))];
        const providerDetailsMap = new Map();

        if (providerIds.length > 0) {
          const MaxInQueryItems = 30;
          for (let i = 0; i < providerIds.length; i += MaxInQueryItems) {
            const batchIds = providerIds.slice(i, i + MaxInQueryItems);
            if (batchIds.length > 0) {
              const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', batchIds));
              const usersSnapshot = await getDocs(usersQuery);
              usersSnapshot.docs.forEach(doc => {
                providerDetailsMap.set(doc.id, { 
                  username: doc.data().username,
                  profileImage: doc.data().profileImage,
                  rating: doc.data().rating, // This is provider's overall rating
                  id: doc.id
                });
              });
            }
          }
        }
        
        // Step 3: Combine service (with its calculated rating) and provider details
        const finalServicesWithProviders = servicesWithRatings.map(service => ({
          ...service,
          providerDetails: providerDetailsMap.get(service.userId) || null,
        }));

        setServicesWithProviders(finalServicesWithProviders);
        setLoading(false);
      }, error => {
        console.error("Error fetching services snapshot:", error);
        setLoading(false);
      });

      return () => unsubscribeServices();
    };

    fetchServicesAndProviders();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero Section */}
      <div
        className="h-[400px] bg-cover bg-center flex flex-col justify-center items-center text-white px-4"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center drop-shadow-lg">
          Our service providers got it from here
        </h1>
        <p className="text-lg md:text-xl mt-3 text-center drop-shadow">
          Find the perfect service provider
        </p>
      </div>

      {/* Categories Section */}
      <section className="px-5 h-500 py-12">
        <h2 className="text-2xl font-bold mb-6 text-black">Filter by Category</h2>
        {categories.length > 0 ? (
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop={true}
            emulateTouch={true}
            centerMode={true}
            centerSlidePercentage={100 / (window.innerWidth < 768 ? 3: window.innerWidth < 1024 ? 3.5 : 4.5)}
            swipeable={true}
            showArrows={true}
            className="category-carousel"
          >
            {categories.map((category) => (
              <div
                key={category.value}
                className={`mx-2 p-3 h-24 flex items-center justify-center bg-[#FFF9BF] text-black border border-gray-300 rounded-xl shadow-md ${category.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transform hover:scale-105'} transition-all duration-200`}
                onClick={() => !category.disabled && navigate(`/search/${category.value}`)}
                style={{ minWidth: '150px' }}
              >
                <h3 className="text-base font-semibold text-center">{category.label}</h3>
              </div>
            ))}
          </Carousel>
        ) : (
          <p>No categories available.</p>
        )}
      </section>

      {/* Services Section */}
      <section className="px-5 pb-10">
        <h2 className="text-2xl font-bold mb-4 text-black">Featured Providers</h2>
        {loading ? (
          <p className="text-black">Loading services...</p>
        ) : servicesWithProviders.length === 0 ? (
          <p className="text-black">No providers found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {servicesWithProviders.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  if (currentUser) {
                    navigate(`/ServiceDetails/${service.id}`);
                  } else {
                    alert("Please log in to look at their account.");
                  }
                }}
                className="bg-[#CB9DF0] border border-black-500 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <img 
                  src={service.images?.[0] || fallbackServiceCardImage}
                  alt={service.title || 'Service image'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    if (e.target.src !== fallbackServiceCardImage) {
                        e.target.onerror = null;
                        e.target.src = fallbackServiceCardImage;
                    }
                  }}
                />
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">{service.title || 'Untitled Service'}</h3>
                  {service.providerDetails && (
                    <div className="flex items-center mt-2 mb-2">
                      {service.providerDetails.profileImage && (
                        <img 
                          src={service.providerDetails.profileImage || fallbackProviderAvatar}
                          alt={service.providerDetails.username || 'Provider'}
                          className="w-8 h-8 rounded-full mr-2 object-cover"
                          onError={(e) => {
                            if (e.target.src !== fallbackProviderAvatar) {
                                e.target.onerror = null;
                                e.target.src = fallbackProviderAvatar;
                            }
                          }}
                        />
                      )}
                      <p className="text-sm text-gray-100 truncate">
                        {service.providerDetails.username || 'Service Provider'}
                      </p>
                    </div>
                  )}
                  <div className="mt-auto">
                    <span className="text-sm font-medium text-yellow-300">★ {service.serviceRatingCount > 0 ? service.serviceAvgRating.toFixed(1) : 'New'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
