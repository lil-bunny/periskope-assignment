import { HomeIcon, ChatBubbleLeftIcon, TicketIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  return (
    <div className="w-[3%] h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-6">
      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <HomeIcon className="w-6 h-6" />
      </button>
      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ChatBubbleLeftIcon className="w-6 h-6" />
      </button>
      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <TicketIcon className="w-6 h-6" />
      </button>
      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ChartBarIcon className="w-6 h-6" />
      </button>
    </div>
  );
} 