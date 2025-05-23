import { configureStore } from '@reduxjs/toolkit';
import chatReducer, { ChatState } from './chatSlice';

const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// Debug: Log state changes
store.subscribe(() => {
  console.log('Redux State:', store.getState());
});

export type RootState = {
  chat: ChatState;
};
export type AppDispatch = typeof store.dispatch;

export { store }; 