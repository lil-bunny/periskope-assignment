'use client';

import { ArrowPathIcon, QuestionMarkCircleIcon, StarIcon, ShareIcon, BellIcon, BellSlashIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-full h-12 border-b border-gray-200 bg-white flex items-center justify-end px-4">
      <div className="flex items-center space-x-2">
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowPathIcon className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <QuestionMarkCircleIcon className="w-4 h-4" />
        </button>
        <div className="relative">
          <select className="p-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-300">
            <option>5/6 phones</option>
          </select>
        </div>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <span className="text-lg">⭐</span>
        </button>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ShareIcon className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <BellSlashIcon className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ClipboardDocumentListIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 