import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Chat, Message } from '@/types/chat';

const initialState: ChatState = {
  chats: [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      lastMessageTime: new Date(),
      messages: [
        {
          id: '1',
          content: 'Hey, how are you?',
          senderId: '1',
          timestamp: new Date(),
        },
      ],
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'See you tomorrow!',
      lastMessageTime: new Date(),
      messages: [
        {
          id: '1',
          content: 'See you tomorrow!',
          senderId: '2',
          timestamp: new Date(),
        },
      ],
    },
  ],
  selectedChatId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectChat: (state, action: PayloadAction<string>) => {
      state.selectedChatId = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.messages.push(action.payload.message);
        chat.lastMessage = action.payload.message.content;
        chat.lastMessageTime = action.payload.message.timestamp;
      }
    },
  },
});

export const { selectChat, addMessage } = chatSlice.actions;
export default chatSlice.reducer; 