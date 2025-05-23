import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types
export interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Message Operations
export const messageHelpers = {
  // Create a new message
  async createMessage(content: string, chatId: string) {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          chat_id: chatId,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get messages for a chat
  async getMessages(chatId: string) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Update a message
  async updateMessage(messageId: string, content: string) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('messages')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a message
  async deleteMessage(messageId: string) {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },
};

// Chat Operations
export const chatHelpers = {
  // Create a new chat
  async createChat(title: string) {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          title,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all chats for the current user
  async getUserChats() {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single chat with its messages
  async getChatWithMessages(chatId: string) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (*)
      `)
      .eq('id', chatId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update chat title
  async updateChatTitle(chatId: string, title: string) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('chats')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', chatId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a chat and its messages
  async deleteChat(chatId: string) {
    const supabase = createClientComponentClient();
    
    // First delete all messages in the chat
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);

    if (messagesError) throw messagesError;

    // Then delete the chat
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (chatError) throw chatError;
  },
};

// User Operations
export const userHelpers = {
  // Get current user profile
  async getCurrentUser() {
    const supabase = createClientComponentClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  },

  // Get all users
  async getAllUsers() {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email');
    console.log("data---------------------", data)
    if (error) {
      console.error('Error fetching users:', error.message);
      return [];
    }

    return data;
  },

  // Store user details after login
  async storeUserDetails() {
    console.log("storeUserDetails called")
    const supabase = createClientComponentClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw checkError;
    }

    // If user doesn't exist, create new user record
    if (!existingUser) {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'User', // Use part before @ as default name
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } else {
      console.log("User already exists")
    }

    return existingUser;
  },

  // Update user profile
  async updateUserProfile(updates: { username?: string; avatar_url?: string }) {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Real-time subscriptions
export const subscriptionHelpers = {
  // Subscribe to chat messages
  subscribeToMessages(chatId: string, callback: (payload: any) => void) {
    const supabase = createClientComponentClient();
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user's chats
  subscribeToUserChats(callback: (payload: any) => void) {
    const supabase = createClientComponentClient();
    return supabase
      .channel('user_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        callback
      )
      .subscribe();
  },
}; 