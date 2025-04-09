import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../database/authDatabase';
import ReactPlayer from 'react-player';
import logo from '../assets/favicon.png';
import bgVideo from '../assets/animated-background.mp4';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const response = await loginUser(email, password);
      setLoading(false);

      if (response.success) {
        alert(`Welcome, ${response.user.email}!`);
        navigate(response.isAdmin ? '/admin-dashboard' : '/Home', { replace: true });
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
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

      <div className="absolute z-10 bg-black/60 backdrop-blur-md rounded-xl px-8 py-10 w-[90%] max-w-md text-white shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Welcome back</h1>
        <p className="text-center text-purple-300 mb-6">Sign in to your account to continue</p>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <div className="space-y-4">
          <div className="flex items-center border border-purple-400 rounded-md px-3 py-2 bg-black/30">
            <Mail className="text-purple-400 mr-2" size={20} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-purple-400"
            />
          </div>

          <div className="flex items-center border border-purple-400 rounded-md px-3 py-2 bg-black/30">
            <Lock className="text-purple-400 mr-2" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-purple-400"
            />
          </div>

          <div className="text-right">
            <button className="text-sm text-purple-300 hover:underline">Forgot password?</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition ${
              loading && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-purple-300 hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
