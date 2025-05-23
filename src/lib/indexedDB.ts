import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface Conversation {
  id: string;
  type: 'single' | 'group';
  name: string;
  participants: string[];
  lastMessage?: {
    text: string;
    created_at: string;
    sender_id: string;
  };
}

interface ChatDB extends DBSchema {
  messages: {
    key: string;
    value: Message;
    indexes: { 'by-conversation': string };
  };
  conversations: {
    key: string;
    value: Conversation;
  };
}

class IndexedDBService {
  private db: IDBPDatabase<ChatDB> | null = null;
  private readonly DB_NAME = 'chatDB';
  private readonly VERSION = 1;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<ChatDB>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        // Create messages store with index
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('by-conversation', 'conversation_id');
        }

        // Create conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      },
    });

    return this.db;
  }

  async saveMessage(message: Message) {
    const db = await this.init();
    await db.put('messages', message);
  }

  async saveMessages(messages: Message[]) {
    const db = await this.init();
    const tx = db.transaction('messages', 'readwrite');
    await Promise.all(messages.map(message => tx.store.put(message)));
    await tx.done;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const db = await this.init();
    const index = db.transaction('messages').store.index('by-conversation');
    return index.getAll(conversationId);
  }

  async saveConversation(conversation: Conversation) {
    const db = await this.init();
    await db.put('conversations', conversation);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const db = await this.init();
    return db.get('conversations', id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.init();
    return db.getAll('conversations');
  }

  async clearMessages() {
    const db = await this.init();
    await db.clear('messages');
  }

  async clearConversations() {
    const db = await this.init();
    await db.clear('conversations');
  }
}

export const indexedDBService = new IndexedDBService(); 