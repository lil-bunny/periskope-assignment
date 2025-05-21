'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import RightSidebar from '@/components/RightSidebar';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        console.log("session", session)
        if (session) {
          setUser(session.user);
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
      } else {
        setUser(null);
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

  if (!user) {
    return null; // Let the router handle the redirect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar/>
          <ChatList />
          <div className="flex-1">
            <ChatWindow />
          </div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

