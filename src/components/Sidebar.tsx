import { useState } from 'react';
import { 
  BsHouse, 
  BsChatDots, 
  BsClipboard, 
  BsGraphUp, 
  BsList, 
  BsBell, 
  BsGit, 
  BsCodeSlash, 
  BsImage, 
  BsCheckCircle, 
  BsGear 
} from 'react-icons/bs';

export default function Sidebar() {
  const [selectedIcon, setSelectedIcon] = useState('home');

  return (
    <div className="w-[3%] h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-6">
      <button 
        className={`p-3 rounded-lg transition-colors ${
          selectedIcon === 'home' 
            ? 'text-green-600 bg-green-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={() => setSelectedIcon('home')}
      >
        <BsHouse className="w-6 h-6" />
      </button>
      <button 
        className={`p-3 rounded-lg transition-colors ${
          selectedIcon === 'chat' 
            ? 'text-green-600 bg-green-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={() => setSelectedIcon('chat')}
      >
        <BsChatDots className="w-6 h-6" />
      </button>
      <button 
        className={`p-3 rounded-lg transition-colors ${
          selectedIcon === 'ticket' 
            ? 'text-green-600 bg-green-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={() => setSelectedIcon('ticket')}
      >
        <BsClipboard className="w-6 h-6" />
      </button>
      <button 
        className={`p-3 rounded-lg transition-colors ${
          selectedIcon === 'chart' 
            ? 'text-green-600 bg-green-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={() => setSelectedIcon('chart')}
      >
        <BsGraphUp className="w-6 h-6" />
      </button>
    </div>
  );
} 