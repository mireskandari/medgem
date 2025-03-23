'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const router = useRouter();
  const supabaseClient = createClientComponentClient();

  useEffect(() => {
    setFadeIn(true);
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          router.push('/');
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    checkSession();
  }, [router]);

  const generateClientId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `CLT-${timestamp}-${randomStr}`.toUpperCase();
  };

  const checkExistingUser = async (email: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: 'dummy-password', // This will fail but tell us if the user exists
      });

      // If we get a specific error, the user exists but password is wrong
      if (error?.message.includes('Invalid login credentials')) {
        return true;
      }
      // If we get a different error, the user doesn't exist
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Check if user already exists
        const userExists = await checkExistingUser(email);
        if (userExists) {
          setError('Email already in use');
          setIsSignUp(false);
          setLoading(false);
          return;
        }

        // Validate password confirmation for sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const clientId = generateClientId();
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { client_id: clientId },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Email already in use. Please sign in instead.');
            setIsSignUp(false);
          } else {
            throw error;
          }
          return;
        }

        // Show success message for sign up
        setError('Check your email for the confirmation link!');
        return;
      } else {
        console.log('Attempting sign in...');
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          throw error;
        }

        console.log('Sign in successful, data:', data);
        
        // Get the session after sign in
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('Session after sign in:', session);
        
        if (session) {
          console.log('Session exists, navigating to home...');
          // Force a hard refresh to ensure session is properly set
          window.location.href = '/';
        } else {
          console.error('No session after sign in');
          setError('Failed to establish session. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      // Ensure the loader stays visible for 3 seconds before hiding
      setTimeout(() => setLoading(false), 3000);
    }
  };

  // Loader component with fade in/out animation added
  function Loader() {
    return (
      <>
        <figure className="loader">
          <div className="dot white"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </figure>
        <style jsx>{`
          .loader {
            position: absolute;
            margin: auto;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 6.250em;
            height: 6.250em;
            animation: rotate5123 2.4s linear infinite, fadeInOut 2.4s linear infinite;
          }
          .white {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            animation: flash 2.4s linear infinite;
            opacity: 0;
          }
          .dot {
            position: absolute;
            margin: auto;
            width: 2.4em;
            height: 2.4em;
            border-radius: 100%;
            transition: all 1s ease;
          }
          .dot:nth-child(2) {
            top: 0;
            bottom: 0;
            left: 0;
            background: #FF4444;
            animation: dotsY 2.4s linear infinite;
          }
          .dot:nth-child(3) {
            left: 0;
            right: 0;
            top: 0;
            background: #FFBB33;
            animation: dotsX 2.4s linear infinite;
          }
          .dot:nth-child(4) {
            top: 0;
            bottom: 0;
            right: 0;
            background: #99CC00;
            animation: dotsY 2.4s linear infinite;
          }
          .dot:nth-child(5) {
            left: 0;
            right: 0;
            bottom: 0;
            background: #33B5E5;
            animation: dotsX 2.4s linear infinite;
          }
          @keyframes rotate5123 {
            0% {
              transform: rotate(0);
            }
            10% {
              width: 6.250em;
              height: 6.250em;
            }
            66% {
              width: 2.4em;
              height: 2.4em;
            }
            100% {
              transform: rotate(360deg);
              width: 6.250em;
              height: 6.250em;
            }
          }
          @keyframes fadeInOut {
            0% { opacity: 0; }
            25% { opacity: 1; }
            75% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes dotsY {
            66% {
              opacity: 0.1;
              width: 2.4em;
            }
            77% {
              opacity: 1;
              width: 0;
            }
          }
          @keyframes dotsX {
            66% {
              opacity: 0.1;
              height: 2.4em;
            }
            77% {
              opacity: 1;
              height: 0;
            }
          }
          @keyframes flash {
            33% {
              opacity: 0;
              border-radius: 0%;
            }
            55% {
              opacity: 0.6;
              border-radius: 100%;
            }
            66% {
              opacity: 0;
            }
          }
        `}</style>
      </>
    );
  }

  // When loading is true, show the loader full-screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative">
        <Loader />
      </div>
    );
  }
  
  // Otherwise, render the login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className={`w-full max-w-md transform transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-200">
          <div className="text-center mb-8 transform transition-all duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center animate-fade-in">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  Processing...
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setConfirmPassword('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 relative group"
              >
                <span className="relative">
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
