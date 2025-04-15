import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { getCurrentUser } from '../database/authDatabase';

export default function AddServiceScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [serviceType, setServiceType] = useState('remote');
  const [priceType, setPriceType] = useState('flat');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [images, setImages] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
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
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUsername(user.username);
        if (!user.isProvider) {
          alert("Access Denied: Only service providers can add services.");
        }
      }
    };
    fetchUser();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setImages(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async () => {
    if (!title || !description || !category || !price || !deliveryTime) {
      alert('Missing Fields: Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Error: User not authenticated.');
        setLoading(false);
        return;
      }

      const serviceData = {
        title,
        description,
        category: category.value,
        serviceType,
        priceType,
        price: parseFloat(price),
        deliveryTime,
        images: images.map(file => file.preview), // Use preview URLs
        username,
        userId: user.uid, // Add the user's UID
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'services'), serviceData);

      alert('Success: Service added successfully!');
      setTitle('');
      setDescription('');
      setCategory(null);
      setServiceType('remote');
      setPriceType('flat');
      setPrice('');
      setDeliveryTime('');
      setImages([]);

    } catch (error) {
      console.error('Error:', error);
      alert('Error: Something went wrong while adding the service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Add New Service</h1>

        <input
          type="text"
          placeholder="Service Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
        />

        <textarea
          placeholder="Service Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg h-32"
        />

        <label className="block text-lg mb-2">Category</label>
        <Select
          value={category}
          onChange={setCategory}
          options={categories}
          className="w-full mb-4"
        />

        <label className="block text-lg mb-2">Service Type</label>
        <div className="flex mb-4">
          {['remote', 'in-person'].map((type) => (
            <button
              key={type}
              onClick={() => setServiceType(type)}
              className={`px-4 py-2 mr-2 rounded-lg ${serviceType === type ? 'bg-purple-500 text-white' : 'bg-white border border-gray-300'}`}
            >
              {type === 'remote' ? 'Remote' : 'In-Person'}
            </button>
          ))}
        </div>

        <label className="block text-lg mb-2">Pricing</label>
        <div className="flex mb-4">
          {['flat', 'hourly'].map((type) => (
            <button
              key={type}
              onClick={() => setPriceType(type)}
              className={`px-4 py-2 mr-2 rounded-lg ${priceType === type ? 'bg-purple-500 text-white' : 'bg-white border border-gray-300'}`}
            >
              {type === 'flat' ? 'Flat Rate' : 'Hourly'}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Enter price (e.g. 50)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
        />

        <input
          type="text"
          placeholder="Estimated delivery time (e.g. 3 days)"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
        />

        <div {...getRootProps()} className="w-full p-3 mb-4 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer">
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-500 text-white p-3 rounded-lg"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
