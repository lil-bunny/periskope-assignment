'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userHelpers } from '@/lib/supabase-helpers';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import RightSidebar from '@/components/RightSidebar';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        console.log("🔵 Current Session:", session);
        
        if (session) {
          setUser(session.user);
          // Get and log user details from users table
          try {
            const details = await userHelpers.storeUserDetails();
            if (mounted) {
              console.log("✅ User Details from Database:", details);
              setUserDetails(details);
            }
          } catch (error) {
            console.error("❌ Error getting user details:", error);
            // Don't redirect on this error, as the session is still valid
          }
        } else {
          router.replace('/auth');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          router.replace('/auth');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session) {
        setUser(session.user);
        // Get and log user details when auth state changes
        userHelpers.storeUserDetails()
          .then(details => {
            if (mounted) {
              console.log("✅ User Details after Auth Change:", details);
              setUserDetails(details);
            }
          })
          .catch(error => {
            console.error("❌ Error getting user details after auth change:", error);
            // Don't redirect on this error
          });
      } else {
        setUser(null);
        setUserDetails(null);
        router.replace('/auth');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !userDetails) {
    return null; // Let the router handle the redirect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar/>
          <ChatList currentUserId={userDetails.id} />
          <div className="flex-1">
            <ChatWindow currentUserId={userDetails.id} />
          </div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

