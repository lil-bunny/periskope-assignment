'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { addMessage, setMessages } from '@/lib/store/chatSlice';
import Avatar from './Avatar';
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon, MicrophoneIcon, MagnifyingGlassIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

interface ChatWindowProps {
  currentUserId: string;
}

interface Conversation {
  id: string;
  type: string;
  name: string | null;
  conversation_participants: {
    user_id: string;
  }[];
}

interface TypingStatus {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export default function ChatWindow({ currentUserId }: ChatWindowProps) {
  const dispatch = useDispatch();
  const { selectedUser, messages } = useSelector((state: RootState) => state.chat);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const messagesContainer = messagesEndRef.current;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('ChatWindow - selectedUser changed:', selectedUser);
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  // Separate effect for real-time subscription
  useEffect(() => {
    if (!conversation?.id || !selectedUser?.id || !currentUserId) {
      
      console.log("real time subscription------------");
      return};

    console.log('Setting up real-time subscription for conversation:', conversation.id);
    
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          // Only add message if we're not the sender
          if (payload.new.sender_id !== currentUserId) {
            const newMessage = {
              id: payload.new.id,
              content: payload.new.text,
              sender_id: payload.new.sender_id,
              receiver_id: selectedUser.id,
              created_at: payload.new.created_at,
              conversation_id: payload.new.conversation_id
            };
            dispatch(addMessage(newMessage));
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log('Cleaning up subscription for conversation:', conversation.id);
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, selectedUser?.id, currentUserId, dispatch]);

  // Effect for typing status subscription
  useEffect(() => {
    if (!conversation?.id || !selectedUser?.id) return;

    console.log('Setting up typing status subscription for conversation:', conversation.id);

    // First, remove any existing channel to prevent duplicates
    const existingChannel = supabase.getChannels().find(ch => ch.topic === `typing:${conversation.id}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    // Create a new channel with a unique name
    const channelName = `typing:${conversation.id}:${currentUserId}`;
    console.log('Creating channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          try {
            console.log('Typing status update received:', {
              payload,
              selectedUserId: selectedUser.id,
              currentUserId: currentUserId,
              isTyping: (payload.new as TypingStatus).is_typing,
              event: payload.eventType,
              channel: channelName
            });
            
            const newStatus = payload.new as TypingStatus;
            // Update if the typing status is from the other user in the conversation
            if (newStatus.user_id !== currentUserId) {
              console.log('Setting typing status to:', newStatus.is_typing, 'for user:', newStatus.user_id);
              setIsTyping(newStatus.is_typing);
            }
          } catch (error) {
            console.error('Error processing typing status update:', error);
          }
        }
      )
      .subscribe((status) => {
        try {
          console.log('Subscription status:', status, 'for channel:', channelName);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to typing status updates');
            // After successful subscription, fetch current typing status
            fetchTypingStatus();
          } else if (status === 'CLOSED') {
            console.log('Typing status subscription closed');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error in typing status subscription');
          }
        } catch (error) {
          console.error('Error handling subscription status:', error);
        }
      });

    // Initial fetch of typing status
    const fetchTypingStatus = async () => {
      try {
        // For group chats, we don't need to create typing status for each user
        if (selectedUser.isGroup) {
          return;
        }

        const { data, error } = await supabase
          .from('typing_status')
          .select('*')
          .eq('conversation_id', conversation.id)
          .eq('user_id', selectedUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching typing status:', error);
          return;
        }

        console.log('Initial typing status:', data);
        if (data) {
          setIsTyping(data.is_typing);
        } else {
          // If no typing status exists yet, create one with is_typing = false
          const { error: createError } = await supabase
            .from('typing_status')
            .insert([
              {
                conversation_id: conversation.id,
                user_id: selectedUser.id,
                is_typing: false,
                updated_at: new Date().toISOString()
              }
            ]);

          if (createError) {
            console.error('Error creating initial typing status:', createError);
          }
        }
      } catch (error) {
        console.error('Error in fetchTypingStatus:', error);
      }
    };

    return () => {
      try {
        console.log('Cleaning up typing status subscription for channel:', channelName);
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error cleaning up typing status subscription:', error);
      }
    };
  }, [conversation?.id, selectedUser?.id, currentUserId]);

  const updateTypingStatus = async (typing: boolean) => {
    if (!conversation?.id) return;

    try {
      console.log('Updating typing status:', { 
        typing, 
        conversationId: conversation.id,
        userId: currentUserId 
      });

      const { data, error } = await supabase
        .from('typing_status')
        .upsert({
          conversation_id: conversation.id,
          user_id: currentUserId,
          is_typing: typing,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'conversation_id,user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating typing status:', error);
      } else {
        console.log('Typing status updated successfully:', data);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleTyping = () => {
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set typing to true
    updateTypingStatus(true);

    // Set new timeout to set typing to false after 3 seconds
    const timeout = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);

    setTypingTimeout(timeout);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const loadMessages = async () => {
    if (!selectedUser || !currentUserId) return;

    try {
      let conversationId: string;

      // For group chats, use the conversation ID directly
      if (selectedUser.isGroup) {
        conversationId = selectedUser.id;
        setConversation({
          id: conversationId,
          type: 'group',
          name: selectedUser.name,
          conversation_participants: []
        });
      } else {
        // For single chats, find or create conversation
        const { data: existingConversations, error: fetchError } = await supabase
          .from('conversations')
          .select(`
            id,
            type,
            name,
            conversation_participants (
              user_id
            )
          `)
          .eq('type', 'single');

        if (fetchError) {
          console.error('Error fetching conversations:', fetchError);
          return;
        }

        // Find conversation where both users are participants
        const foundConversation = existingConversations?.find(conv => {
          const participants = conv.conversation_participants.map((p: any) => p.user_id);
          return participants.includes(currentUserId) && participants.includes(selectedUser.id);
        });

        if (!foundConversation) {
          console.log('No existing conversation found');
          setConversation(null);
          return;
        }

        conversationId = foundConversation.id;
        setConversation(foundConversation);
      }

      // Fetch messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
      }

      // Transform messages to match our Redux store format
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.text,
        sender_id: msg.sender_id,
        receiver_id: selectedUser.isGroup ? null : selectedUser.id,
        created_at: msg.created_at,
        conversation_id: msg.conversation_id
      }));

      dispatch(setMessages(formattedMessages));
      console.log('Loaded messages:', formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Send message triggered', {
      newMessage,
      selectedUser,
      currentUserId
    });

    if (!newMessage.trim() || !selectedUser || !currentUserId) {
      console.log('Message not sent - missing data:', {
        hasMessage: !!newMessage.trim(),
        hasSelectedUser: !!selectedUser,
        hasCurrentUserId: !!currentUserId
      });
      return;
    }

    try {
      let conversationId: string;

      // For group chats, we use the conversation ID directly
      if (selectedUser.isGroup) {
        conversationId = selectedUser.id;
      } else {
        // Step 1: Check if conversation exists
        const { data: existingConversations, error: fetchError } = await supabase
          .from('conversations')
          .select(`
            id,
            type,
            name,
            conversation_participants (
              user_id
            )
          `)
          .eq('type', 'single');

        if (fetchError) {
          console.error('Error fetching conversations:', fetchError);
          return;
        }

        // Find conversation where both users are participants
        let conversation = existingConversations?.find(conv => {
          const participants = conv.conversation_participants.map((p: any) => p.user_id);
          return participants.includes(currentUserId) && participants.includes(selectedUser.id);
        });

        // If no conversation exists, create one
        if (!conversation) {
          // Generate a random UUID for the conversation
          const newConversationId = crypto.randomUUID();
          
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert([
              { 
                id: newConversationId,
                type: 'single',
                name: null
              }
            ])
            .select()
            .single();

          if (createError || !newConversation) {
            console.error('Error creating conversation:', createError);
            return;
          }

          conversation = newConversation;

          // Add participants to the conversation
          const { error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
              { conversation_id: newConversationId, user_id: currentUserId },
              { conversation_id: newConversationId, user_id: selectedUser.id }
            ]);

          if (participantsError) {
            console.error('Error adding participants:', participantsError);
            return;
          }
        }

        if (!conversation) {
          console.error('Failed to get or create conversation');
          return;
        }

        conversationId = conversation.id;
      }

      console.log('Using conversation:', conversationId);

      // Generate a random UUID for the message
      const messageId = crypto.randomUUID();
      console.log('messageId:', messageId);

      // Insert message into database
      const { data: savedMessage, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            id: messageId,
            conversation_id: conversationId,
            sender_id: currentUserId,
            text: newMessage,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (messageError) {
        console.error('Error saving message:', messageError);
        return;
      }

      const message = {
        id: messageId,
        content: newMessage,
        sender_id: currentUserId,
        receiver_id: selectedUser.isGroup ? null : selectedUser.id,
        created_at: new Date().toISOString(),
        conversation_id: conversationId
      };

      console.log('Sending message:', {
        message,
        currentUser: {
          id: currentUserId,
          name: 'You',
        },
        recipient: selectedUser.isGroup ? {
          id: conversationId,
          name: selectedUser.name,
          isGroup: true
        } : {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email
        }
      });

      dispatch(addMessage(message));
      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Add this effect to fetch user names
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!selectedUser?.isGroup) return;

      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name');

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        const nameMap = users.reduce((acc, user) => ({
          ...acc,
          [user.id]: user.name
        }), {});

        setUserNames(nameMap);
      } catch (error) {
        console.error('Error in fetchUserNames:', error);
      }
    };

    fetchUserNames();
  }, [selectedUser?.isGroup]);

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar name={selectedUser.name} size="sm" />
            <div>
              <h2 className="text-base font-medium text-gray-900">{selectedUser.name}</h2>
              <p className="text-xs text-gray-500">
                {isTyping ? 'typing...' : selectedUser.email || 'No email'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex flex-col max-w-[85%]">
                  {selectedUser.isGroup && message.sender_id !== currentUserId && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">
                      {userNames[message.sender_id] || 'Unknown User'}
                    </span>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender_id === currentUserId
                        ? 'bg-[#D9FDD3] text-gray-900'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 text-right ${
                      message.sender_id === currentUserId ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg p-3 bg-white text-gray-900 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage}>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-0 border-0"
              />
              <button
                type="submit"
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5 fill-current" />
              </button>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <button type="button" className="hover:text-gray-700 transition-colors">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <button type="button" className="hover:text-gray-700 transition-colors">
                <FaceSmileIcon className="w-5 h-5" />
              </button>
              <button type="button" className="hover:text-gray-700 transition-colors">
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 