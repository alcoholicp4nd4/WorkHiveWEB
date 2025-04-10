import React from 'react';

export default function ServiceDetailsScreen({ route }) {
  const { service } = route.params; // Get the service data passed from the HomeScreen

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="pt-12 pb-5 bg-purple-300 text-center rounded-b-3xl mb-4">
          <h1 className="text-3xl font-bold text-white mb-1">{service.username}</h1>
          <p className="text-lg text-white">{service.category}</p>
        </div>
        
        <img src={service.image} alt="Service" className="w-full h-64 object-cover rounded-lg mt-4 mb-5" />

        <div className="p-5 bg-white rounded-lg shadow-md mb-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Service Description</h2>
          <p className="text-base text-gray-600 leading-relaxed">{service.serviceDescription}</p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Provider Description</h2>
          <p className="text-base text-gray-600 leading-relaxed">{service.providerDescription}</p>
        </div>
      </div>
    </div>
  );
}