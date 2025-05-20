export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  messages: Message[];
}

export interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
} 