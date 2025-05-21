import { HomeIcon, ChatBubbleLeftIcon, TicketIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function RightSidebar() {
  return (
    <div className="w-20 h-screen border-l border-gray-200 bg-white flex flex-col items-center py-4 space-y-6">
      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <HomeIcon className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ChatBubbleLeftIcon className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <TicketIcon className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ChartBarIcon className="w-5 h-5" />
      </button>
    </div>
  );
} 