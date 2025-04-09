import React from 'react';

const favoriteProviders = [
  {
    id: 1,
    name: 'Sarah Johnson',
    service: 'Interior Designer',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Michael Chen',
    service: 'Personal Trainer',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400',
  },
];

export default function Favorites() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#CB9DF0] py-10 px-6">
        <h1 className="text-white text-3xl font-bold">Favorites</h1>
      </header>

      {/* Favorite Cards */}
      <section className="max-w-4xl mx-auto p-6 space-y-6">
        {favoriteProviders.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center bg-[#F0C1E1] rounded-xl overflow-hidden shadow-md hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
          >
            <img
              src={provider.image}
              alt={provider.name}
              className="w-28 h-28 object-cover"
            />
            <div className="flex flex-col justify-center px-6 py-3">
              <p className="text-xl font-semibold text-gray-800">{provider.name}</p>
              <p className="text-sm text-gray-600 mt-1">{provider.service}</p>
              <p className="text-sm text-gray-700 font-medium mt-2">★ {provider.rating}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
