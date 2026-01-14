// File: src/app/page.js

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function OrgEntryPage() {
  const [orgCode, setOrgCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orgCode.trim()) {
      toast.error('Please enter organization code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgCode: orgCode.trim() })
      });

      const data = await res.json();

      if (data.success) {
        // Store org data in localStorage
        localStorage.setItem('orgData', JSON.stringify(data.data));
        toast.success('Organization verified!');
        
        // Redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 500);
      } else {
        toast.error(data.message || 'Invalid organization code');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <span className="text-4xl">🚗</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">HireFlow</h1>
          <p className="text-blue-100">Vehicle Hire Management System</p>
        </div>

        {/* Entry Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Enter Organization Code
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="orgCode" className="block text-sm font-medium text-white mb-2">
                Organization Code
              </label>
              <input
                id="orgCode"
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                placeholder="e.g., HOTEL001"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            Contact your administrator for organization code
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-white/60">
          © 2026 HireFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}