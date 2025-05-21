import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Avatar from './Avatar';
import { FolderPlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function ChatList() {
  const dispatch = useDispatch();
  const { messages, isLoading, error } = useSelector((state: RootState) => state.chat);

  return (
    <div className="h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <FolderPlusIcon className="w-4 h-4" />
                <span>Custom Filter</span>
              </button>
              <button className="px-2 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                Save
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-sm w-32"
                />
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>
              <button className="flex items-center space-x-1 px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <FunnelIcon className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
          >
            <Avatar name={message.role} size="lg" />
            <div className="flex-1 text-left">
              <h3 className="font-bold text-black text-sm">{message.role}</h3>
              <p className="text-xs text-black truncate">
                {message.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 