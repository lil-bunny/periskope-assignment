import { VscCodeOss } from 'react-icons/vsc';
import { BsAt } from 'react-icons/bs';
import { 
  ArrowPathIcon, 
  PencilIcon, 
  Bars3Icon, 
  ViewColumnsIcon, 
  CodeBracketIcon, 
  UserGroupIcon, 
  FolderIcon, 
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';

export default function RightSidebar() {
  return (
    <div className="w-20 h-screen border-l border-gray-200 bg-white flex flex-col items-center py-4 space-y-6">
      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Dashboard"
      >
        <VscCodeOss className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Dashboard
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Refresh"
      >
        <ArrowPathIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Refresh
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Edit"
      >
        <PencilIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Edit
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Menu"
      >
        <Bars3Icon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Menu
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Grid"
      >
        <ViewColumnsIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Grid
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Branch"
      >
        <CodeBracketIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Branch
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Users"
      >
        <UserGroupIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Users
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Email"
      >
        <BsAt className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Email
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="Files"
      >
        <FolderIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Files
        </span>
      </button>

      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group relative"
        title="More"
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
        <span className="absolute left-0 -translate-x-full px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          More
        </span>
      </button>
    </div>
  );
} 