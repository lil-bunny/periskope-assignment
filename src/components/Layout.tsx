import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

export default function Layout() {
  return (
    <div className="flex h-screen bg-white">
      <ChatList />
      <ChatWindow />
    </div>
  );
} 