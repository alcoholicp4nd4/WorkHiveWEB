import { useEffect, useState } from "react";
import { db } from "../database/firebaseConfig";
import { getCurrentUser } from "../database/authDatabase";
import { collection, getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React from "react";

const headerImage = "https://img.freepik.com/photos-premium/homme-vetu-uniforme-tenant-cle_220873-20532.jpg?w=1060";

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([ 
    { label: 'Web Development', value: 'web-development' },
    { label: 'Mobile App Development', value: 'mobile-app-development' },
    { label: 'Software Engineering', value: 'software-engineering' },
    { label: 'UI/UX Design', value: 'ui-ux-design' },
    { label: 'QA Testing', value: 'qa-testing' },
    { label: 'Game Development', value: 'game-development' },
    { label: 'DevOps & Cloud', value: 'devops-cloud' },
    { label: 'Graphic Design', value: 'graphic-design' },
    { label: 'Logo Design', value: 'logo-design' },
    { label: 'Animation', value: 'animation' },
    { label: 'Video Editing', value: 'video-editing' },
    { label: 'Photography', value: 'photography' },
    { label: 'Branding & Identity', value: 'branding' },
    { label: 'Illustration', value: 'illustration' },
    { label: 'SEO Optimization', value: 'seo' },
    { label: 'Digital Marketing', value: 'digital-marketing' },
    { label: 'Social Media Management', value: 'social-media' },
    { label: 'Email Marketing', value: 'email-marketing' },
    { label: 'Copywriting', value: 'copywriting' },
    { label: 'Business Consulting', value: 'business-consulting' },
    { label: 'Sales Strategy', value: 'sales-strategy' },
    { label: 'Plumbing', value: 'plumbing' },
    { label: 'Electrical Work', value: 'electrical' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Moving Services', value: 'moving' },
    { label: 'Handyman Services', value: 'handyman' },
    { label: 'Pest Control', value: 'pest-control' },
    { label: 'Landscaping', value: 'landscaping' },
    { label: 'Tutoring', value: 'tutoring' },
    { label: 'Language Teaching', value: 'language-teaching' },
    { label: 'Life Coaching', value: 'life-coaching' },
    { label: 'Career Coaching', value: 'career-coaching' },
    { label: 'Test Preparation', value: 'test-prep' },
    { label: 'Fitness Training', value: 'fitness-training' },
    { label: 'Yoga Instruction', value: 'yoga' },
    { label: 'Therapy & Counseling', value: 'therapy' },
    { label: 'Nutrition Planning', value: 'nutrition' },
    { label: 'Beauty & Skincare', value: 'beauty' },
    { label: 'Hair Styling', value: 'hair-styling' },
    { label: 'Event Planning', value: 'event-planning' },
    { label: 'Virtual Assistance', value: 'virtual-assistance' },
    { label: 'Data Entry', value: 'data-entry' },
    { label: 'Translation Services', value: 'translation' },
    { label: 'Custom Orders', value: 'custom-orders' },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);
 return (
    <div className="overflow-hidden bg-white">
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
      <section className="px-5 py-8">
        <h2 className="text-2xl font-bold mb-4 text-black">Filter by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((category) => (
            <div
              key={category.value}
              className={`min-w-[150px] p-3 bg-[#FFF9BF] text-xl font-bold text-black border border-gray-300 rounded-xl shadow-md ${category.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !category.disabled && navigate(`/search/${category.value}`)}
            >
              <h3 className="text-base font-semibold text-center">{category.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="px-5 pb-10">
        <h2 className="text-2xl font-bold mb-4 text-black">Featured Providers</h2>
        {loading ? (
          <p className="text-black">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-black">No providers found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  if (currentUser) {
                    navigate(`/chatscreen/${currentUser.uid}/${service.id}`);
                  } else {
                    alert("Please log in to start a chat.");
                  }
                }}
                className="flex bg-[#CB9DF0] text-xl font-bold text-white border border-gray-300 rounded-xl shadow-md p-4 mb-4 cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-sm mt-1">Service Provider</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">★ 5.0</span>
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
