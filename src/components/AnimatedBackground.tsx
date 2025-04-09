import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        {/* Animated shapes */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Service icons */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 text-indigo-600 opacity-20 animate-float animation-delay-1000">🔧</div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 text-blue-600 opacity-20 animate-float animation-delay-2000">💼</div>
        <div className="absolute bottom-1/4 left-1/3 w-8 h-8 text-purple-600 opacity-20 animate-float animation-delay-3000">🎨</div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 text-indigo-600 opacity-20 animate-float animation-delay-4000">📱</div>
      </div>
    </div>
  );
}