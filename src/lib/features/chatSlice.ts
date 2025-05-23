import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  isGroup: any;
  id: string;
  name: string;
  email: string | null;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  selectedUser: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
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