import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import React from 'react';
import logo from '../assets/favicon.png';
import bgVideo from '../assets/animated-background.mp4';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('🔹 Attempting registration...');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const result = await response.json();
      setLoading(false);

      if (result.success) {
        console.log('✅ Registration successful:', result.user);
        alert(`Welcome, ${email}!`);
        navigate('/Home');
      } else {
        console.warn('❌ Registration Error:', result.error);
        alert(`Registration Failed: ${result.error}`);
      }
    } catch (err) {
      setLoading(false);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <ReactPlayer
        url={bgVideo}
        playing
        loop
        muted
        controls={false}
        width="100%"
        height="100%"
        className="absolute top-0 left-0 object-cover z-0"
      />
      <div className="flex flex-col items-center justify-center h-full bg-black/60 px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur p-8 rounded-2xl shadow-lg text-white space-y-6">
          <div className="flex justify-center">
          <img src={logo} alt="Logo" className="w-16 h-16" />
          </div>

          <h1 className="text-2xl font-semibold text-center">Create an Account</h1>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="relative">
              <Mail className="absolute top-3 left-3 text-purple-300" size={20} />
              <input
                type="text"
                className="w-full py-2 pl-10 pr-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <Mail className="absolute top-3 left-3 text-purple-300" size={20} />
              <input
                type="email"
                className="w-full py-2 pl-10 pr-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 text-purple-300" size={20} />
              <input
                type="password"
                className="w-full py-2 pl-10 pr-3 rounded-lg bg-white/20 text-white placeholder-purple-300 focus:outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg ${
                loading ? 'bg-purple-400/50 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
              } transition-colors text-white font-semibold`}
            >
              {loading ? (
                <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
              ) : (
                <>
                  Register <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <button
              className="text-purple-300 hover:underline"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
