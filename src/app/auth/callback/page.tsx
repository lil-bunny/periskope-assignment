'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userHelpers } from '@/lib/supabase-helpers';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔵 Callback: Starting authentication process');
        
        // First check if we already have a session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log('✅ Callback: Existing session found, proceeding to home');
          router.replace('/');
          return;
        }
        
        // Get the code from the URL query parameters
        const code = new URLSearchParams(window.location.search).get('code');
        
        console.log('🔵 Callback: Code present:', !!code);
        
        if (!code) {
          console.error('❌ Callback: No code found in URL');
          setError('Invalid authentication link');
          return;
        }

        console.log('🔵 Callback: Setting up session');
        
        // Exchange the code for a session
        const { data: sessionData, error: setSessionError } = await supabase.auth.exchangeCodeForSession(code);

        console.log('🔵 Callback: Session data:', sessionData);

        if (setSessionError) {
          console.error('❌ Callback: Error setting session:', setSessionError);
          setError('Failed to set up session');
          return;
        }

        if (!sessionData?.session) {
          console.error('❌ Callback: No session data returned');
          setError('Failed to establish session');
          return;
        }

        console.log('✅ Callback: Session set successfully:', sessionData.session.user.email);

        // Store user details in the users table
        try {
          const userDetails = await userHelpers.storeUserDetails();
          console.log('✅ Callback: User details stored:', userDetails);
        } catch (error) {
          console.error('❌ Callback: Error storing user details:', error);
          // Don't throw here, as the session is still valid
        }

        // Clear the URL parameters to prevent issues
        window.history.replaceState(null, '', window.location.pathname);
        
        // Wait a moment to ensure session is properly set
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify session is persisted
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          console.error('❌ Callback: Error verifying session:', getSessionError);
          setError('Failed to verify session');
          return;
        }

        if (!session) {
          console.error('❌ Callback: Session not persisted');
          setError('Session not persisted');
          return;
        }

        console.log('✅ Callback: Session verified and persisted');
        
        // Redirect to home page using router
        console.log('🔵 Callback: Redirecting to home page');
        router.replace('/');
      } catch (error) {
        console.error('❌ Callback: Error in process:', error);
        console.log('❌ Callback: Error in process:', error);
        setError('An unexpected error occurred');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => router.push('/auth')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-lg mb-4">Completing sign in...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  );
} 