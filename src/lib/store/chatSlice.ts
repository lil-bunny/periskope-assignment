import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string | null;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string | null;
  created_at: string;
  conversation_id: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
  isGroup: boolean;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  selectedUser: null,
  isGroup: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      console.log('Adding message to state:', action.payload);
      state.messages.push(action.payload);
      console.log('Updated messages state:', state.messages);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<{ user: User | null; isGroup: boolean }>) => {
      state.selectedUser = action.payload.user;
      state.isGroup = action.payload.isGroup;
      state.messages = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  setLoading,
  setError,
  setSelectedUser,
} = chatSlice.actions;

export default chatSlice.reducer; 