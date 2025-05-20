'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import TopBar from '@/components/TopBar';

export default function Home() {
  return (
    <Provider store={store}>
      <div className="h-screen flex flex-col">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 overflow-hidden">
            <div className="w-1/3 overflow-y-auto">
              <ChatList />
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChatWindow />
            </div>
          </div>
          <RightSidebar />
        </div>
      </div>
    </Provider>
  );
}
