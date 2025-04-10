import { useEffect, useState } from "react";
import { db } from "../database/firebaseConfig";
import { getCurrentUser } from "../database/authDatabase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React from "react";
const categories = [
  {
    id: 1,
    name: 'Home Services',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400',
    count: 150,
  },
  {
    id: 2,
    name: 'Beauty & Wellness',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=400',
    count: 120,
  },
  {
    id: 3,
    name: 'Professional',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
    count: 85,
  },
  {
    id: 4,
    name: 'Education',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400',
    count: 95,
  },
  {
    id: 5,
    name: 'Digital Marketing',
    image: 'https://images.unsplash.com/photo-1581092336626-b7a543c67b79?auto=format&fit=crop&q=80&w=400',
    count: 110,
  },
  {
    id: 6,
    name: 'IT & Tech Support',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=400',
    count: 90,
  },
  {
    id: 7,
    name: 'Legal & Financial Services',
    image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=400',
    count: 70,
  },
  {
    id: 8,
    name: 'Health & Wellness',
    image: 'https://images.unsplash.com/photo-1579722823961-dc78e3b9c63b?auto=format&fit=crop&q=80&w=400',
    count: 130,
  },
  {
    id: 9,
    name: 'Event Planning',
    image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&q=80&w=400',
    count: 80,
  },
  {
    id: 10,
    name: 'Automotive Services',
    image: 'https://images.unsplash.com/photo-1608138278428-2d469735f6eb?auto=format&fit=crop&q=80&w=400',
    count: 75,
  },
  {
    id: 11,
    name: 'Photography & Videography',
    image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80&w=400',
    count: 95,
  },
  {
    id: 12,
    name: 'Writing & Translation',
    image: 'https://images.unsplash.com/photo-1584697964192-f230d51468e7?auto=format&fit=crop&q=80&w=400',
    count: 85,
  },
  {
    id: 13,
    name: 'Home Renovation & Repairs',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a1?auto=format&fit=crop&q=80&w=400',
    count: 140,
  },
  {
    id: 14,
    name: 'Freelance Development & Design',
    image: 'https://images.unsplash.com/photo-1564866657311-e9cc905d29d2?auto=format&fit=crop&q=80&w=400',
    count: 125,
  },
  {
    id: 15,
    name: 'Music & Arts Services',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
    count: 60,
  },
  {
    id: 16,
    name: 'Business Consulting',
    image: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=400',
    count: 50,
  },
  {
    id: 17,
    name: 'Pet Services',
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=400',
    count: 90,
  },
  {
    id: 18,
    name: 'Real Estate & Property Management',
    image: 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?auto=format&fit=crop&q=80&w=400',
    count: 100,
  },
  {
    id: 19,
    name: 'Courier & Delivery Services',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=400',
    count: 85,
  },
];
const headerImage = "https://www.shutterstock.com/image-photo/happy-mid-aged-business-woman-600nw-2353012835.jpg";

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const q = query(collection(db, "users"), where("isProvider", "==", true));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProviders(fetched);
      } catch (err) {
        console.error("❌ Firestore fetch error:", err);
      }
    };
    fetchProviders();

    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="overflow-hidden">
      <div
        className="h-[400px] bg-cover bg-center flex flex-col justify-center items-center px-8"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        <h1 className="text-white text-3xl font-bold text-center">Our service providers got it from here</h1>
        <p className="text-white text-lg mt-2 text-center">Find the perfect service provider</p>
      </div>

      <section className="px-5 py-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="min-w-[200px] bg-white rounded-xl shadow-md cursor-pointer overflow-hidden"
            >
              <img src={category.image} alt={category.name} className="w-full h-32 object-cover" />
              <div className="bg-[#FDDBBB] p-3">
                <h3 className="text-base font-semibold text-gray-800">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} providers</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Featured Providers</h2>
        {providers.length === 0 ? (
          <p>No providers found.</p>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.uid}
              onClick={() => {
                if (currentUser) {
                  navigate(`/chatscreen/${currentUser.uid}/${provider.uid}`);
                }
              }}
              className="flex bg-[#F0C1E1] rounded-xl shadow p-4 mb-4 cursor-pointer"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{provider.username}</h3>
                <p className="text-sm text-gray-600 mt-1">Service Provider</p>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-800">★ 5.0</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}