// File: src/app/login/page.js

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [orgData, setOrgData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get org data from localStorage
    const storedOrgData = localStorage.getItem('orgData');
    if (!storedOrgData) {
      router.push('/');
      return;
    }
    setOrgData(JSON.parse(storedOrgData));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: orgData.orgId,
          username: username.trim(),
          password: password
        })
      });

      const data = await res.json();

      if (data.success) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        toast.success('Login successful!');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.data.user.role === 'driver') {
            router.push('/driver');
          } else {
            router.push('/dashboard');
          }
        }, 500);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!orgData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2000')"
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50">
          {/* Organization Info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg mb-3">
              <span className="text-3xl">🏨</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{orgData.orgName}</h2>
            <p className="text-sm text-gray-600">Organization Code: {orgData.orgCode}</p>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Sign In to Your Account
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Organization Entry
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white drop-shadow-lg">
          © 2026 HireFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}