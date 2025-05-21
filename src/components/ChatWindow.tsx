import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { addMessage } from '@/lib/features/chatSlice';
import { useState } from 'react';
import Avatar from './Avatar';
import { PaperClipIcon, FaceSmileIcon, ClockIcon, StarIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { messages, isLoading, error } = useSelector((state: RootState) => state.chat);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    dispatch(
      addMessage({
        id: Date.now().toString(),
        content: newMessage,
        role: 'user',
        timestamp: Date.now(),
      })
    );
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-white border-b border-gray-200 flex items-center space-x-2">
        <Avatar name="Assistant" size="sm" />
        <h2 className="text-sm font-bold text-black">Assistant</h2>
      </div>
      <div className="flex-1 p-4 space-y-4" style={{
        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
        backgroundRepeat: 'repeat',
        backgroundSize: '410px',
        backgroundAttachment: 'fixed'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-green-100 text-black'
                  : 'bg-white text-black'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 bg-white">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
          <div className="relative">
            <div className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 p-2 focus:outline-none text-black"
              />
              {newMessage.trim() ? (
                <button
                  type="submit"
                  className="p-2 text-green-500 hover:text-green-600"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-start space-x-4">
            <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
              <PaperClipIcon className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
              <FaceSmileIcon className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
              <ClockIcon className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
              <StarIcon className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 