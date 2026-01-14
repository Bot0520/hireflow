// File: src/app/forgot-password/page.js

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [orgData, setOrgData] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedOrgData = localStorage.getItem('orgData');
    if (!storedOrgData) {
      router.push('/');
      return;
    }
    setOrgData(JSON.parse(storedOrgData));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          orgId: orgData.orgId
        })
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        toast.success('Password reset instructions sent to your email');
        
        // For development: show token in console
        if (data.data?.resetToken) {
          console.log('Reset Token:', data.data.resetToken);
          console.log('Reset URL:', `${window.location.origin}/reset-password?token=${data.data.resetToken}`);
        }
      } else {
        toast.error(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
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
      <div className="absolute inset-0 bg-black/40"></div>
      
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50">
          {/* Back Button */}
          <Link 
            href="/login"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Login</span>
          </Link>

          {/* Organization Info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg mb-3">
              <span className="text-3xl">🔑</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
            <p className="text-sm text-gray-600 mt-2">
              {orgData.orgName}
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Sent!</h3>
              <p className="text-gray-600 mb-6">
                Check your email for password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6 text-center">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-white drop-shadow-lg">
          © 2026 HireFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}