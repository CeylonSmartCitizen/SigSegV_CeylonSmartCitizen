'use client';


import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success && data.data && data.data.tokens) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=430, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div
        className="min-h-screen flex flex-col bg-white"
        style={{
          minHeight: '100dvh',
          WebkitTapHighlightColor: 'transparent',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div
          className="flex-1 flex flex-col justify-center items-center px-2 w-full mx-auto"
          style={{
            maxWidth: 430,
            width: '100%',
            paddingTop: 'max(24px, env(safe-area-inset-top))',
            paddingBottom: 0,
          }}
        >
          {/* Logo/Header */}
          <div className="w-full text-center mb-4">
            <h1 className="text-2xl font-bold text-black mb-1 tracking-tight">Ceylon Smart Citizen</h1>
            <p className="text-gray-500 text-base">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4" style={{ maxWidth: 370, margin: '0 auto' }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-black mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder-gray-400 text-base bg-white"
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="username"
                inputMode="email"
                style={{ fontSize: 18, minHeight: 56 }}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-black mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder-gray-400 text-base bg-white"
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                style={{ fontSize: 18, minHeight: 56 }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ minHeight: 56, fontSize: 20 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
        {/* Sticky Footer Links for Mobile with safe-area */}
        <div
          className="w-full px-4 pb-6 pt-2 sticky bottom-0 bg-white border-t border-gray-100 z-10"
          style={{
            maxWidth: 430,
            margin: '0 auto',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            minHeight: 60,
          }}
        >
          <p className="text-center text-base text-gray-500" style={{ fontSize: 16 }}>
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              style={{ fontSize: 16 }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
