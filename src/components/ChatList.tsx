'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Avatar from './Avatar';
import { FolderPlusIcon, MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { userHelpers } from '@/lib/supabase-helpers';
import { setSelectedUser, User, ChatState } from '@/lib/store/chatSlice';
import { store } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { indexedDBService } from '@/lib/indexedDB';

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  users: User[];
}

function GroupChatModal({ isOpen, onClose, currentUserId, users }: GroupChatModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const handleCreateGroup = async () => {
    console.log('Creating group with currentUserId:', currentUserId);
    
    if (!groupName.trim() || selectedUsers.length === 0 || !currentUserId) {
      console.log('Validation failed:', { 
        hasGroupName: !!groupName.trim(), 
        selectedUsersCount: selectedUsers.length,
        hasCurrentUserId: !!currentUserId,
        currentUserId
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating group chat with:', {
        groupName: groupName.trim(),
        selectedUsers,
        currentUserId
      });

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
        .eq('type', 'group')
        .eq('name', groupName.trim());

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError);
        return;
      }

      // Check if a group with this name already exists
      const existingGroup = existingConversations?.find(conv => {
        const participants = conv.conversation_participants.map((p: any) => p.user_id);
        return participants.includes(currentUserId);
      });

      if (existingGroup) {
        console.log('Group with this name already exists:', existingGroup);
        // You might want to show an error message to the user here
        return;
      }

      // Step 2: Create new conversation
      const conversationId = crypto.randomUUID();
      console.log('Generated conversation ID:', conversationId);

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([
          {
            id: conversationId,
            type: 'group',
            name: groupName.trim()
          }
        ])
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError.message);
        throw convError;
      }

      console.log('Conversation created:', conversation);

      // Step 3: Add participants
      const participants = [
        { conversation_id: conversationId, user_id: currentUserId },
        ...selectedUsers.map(userId => ({
          conversation_id: conversationId,
          user_id: userId
        }))
      ];

      console.log('Adding participants:', participants);

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) {
        console.error('Error adding participants:', participantsError.message);
        throw participantsError;
      }

      // Step 4: Add initial system message
      const messageId = crypto.randomUUID();
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            id: messageId,
            conversation_id: conversationId,
            sender_id: currentUserId,
            text: `${groupName} group created`,
            created_at: new Date().toISOString()
          }
        ]);

      if (messageError) {
        console.error('Error creating initial message:', messageError);
        // Don't throw here, as the group was created successfully
      }

      console.log('Group chat created successfully:', {
        conversation,
        participants,
        initialMessage: messageId
      });
      
      // Reset form
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter out current user from the list
  const availableUsers = users.filter(user => user.id !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Group Chat</h2>
        
        <input
          type="text"
          value={groupName}
          onChange={(e) => {
            console.log('Group name changed:', e.target.value);
            setGroupName(e.target.value);
          }}
          placeholder="Group Name"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
        />

        <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-lg">
          {availableUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No users available</div>
          ) : (
            availableUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  selectedUsers.includes(user.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  const newSelectedUsers = selectedUsers.includes(user.id)
                    ? selectedUsers.filter(id => id !== user.id)
                    : [...selectedUsers, user.id];
                  console.log('Selected users updated:', {
                    user,
                    newSelectedUsers,
                    wasSelected: selectedUsers.includes(user.id)
                  });
                  setSelectedUsers(newSelectedUsers);
                }}
              >
                <div className="flex-shrink-0">
                  <Avatar name={user.name} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="flex-shrink-0">
                  {selectedUsers.includes(user.id) ? (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              loading || !groupName.trim() || selectedUsers.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export default function ChatList({ currentUserId }: { currentUserId: string }) {
  const dispatch = useDispatch();
  const { messages, isLoading, error, selectedUser } = useSelector((state: RootState) => state.chat);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Fetch users and conversations
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const allUsers = await userHelpers.getAllUsers();
        console.log('✅ Loaded users:', allUsers);
        setUsers(allUsers);

        // Load conversations from Supabase
        const { data: userConversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            type,
            name,
            conversation_participants (
              user_id,
              users (
                id,
                name,
                email
              )
            )
          `)
          .order('id', { ascending: false });

        if (convError) {
          console.error('Error fetching conversations:', convError);
          return;
        }

        // Store conversations in IndexedDB
        for (const conversation of userConversations || []) {
          // Get the last message for this conversation
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lastMessageError && lastMessageError.code !== 'PGRST116') {
            console.error('Error fetching last message:', lastMessageError);
          }

          console.log('Last message for conversation:', conversation.id, lastMessage);

          const conversationData = {
            id: conversation.id,
            type: conversation.type,
            name: conversation.name,
            participants: conversation.conversation_participants.map((p: any) => p.user_id),
            lastMessage: lastMessage ? {
              text: lastMessage.text,
              created_at: lastMessage.created_at,
              sender_id: lastMessage.sender_id
            } : undefined
          };

          console.log('Saving conversation to IndexedDB:', conversationData);
          await indexedDBService.saveConversation(conversationData);

          // Load messages for this conversation
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            continue;
          }

          // Store messages in IndexedDB
          if (messages) {
            await indexedDBService.saveMessages(messages);
          }
        }

        // Create a Map to track unique participant combinations
        const uniqueConversationsMap = new Map();
        const seenEmails = new Set();

        userConversations?.forEach(conversation => {
          if (conversation.type === 'group') {
            uniqueConversationsMap.set(conversation.id, conversation);
          } else {
            const otherParticipant = conversation.conversation_participants
              .find((p: any) => p.user_id !== currentUserId)?.users as User | undefined;

            if (otherParticipant?.email && !seenEmails.has(otherParticipant.email)) {
              const participantIds = conversation.conversation_participants
                .map((p: any) => p.user_id)
                .sort()
                .join(',');

              if (!uniqueConversationsMap.has(participantIds)) {
                uniqueConversationsMap.set(participantIds, conversation);
                seenEmails.add(otherParticipant.email);
              }
            }
          }
        });

        const uniqueConversations = Array.from(uniqueConversationsMap.values());
        uniqueConversations.sort((a, b) => {
          if (a.type === 'group' && b.type !== 'group') return -1;
          if (a.type !== 'group' && b.type === 'group') return 1;
          return 0;
        });

        console.log('✅ Loaded conversations with last messages:', uniqueConversations);
        setConversations(uniqueConversations || []);
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUserId]);

  const handleUserSelect = (user: User) => {
    console.log('Selected user:', user);
    const selectedUser = {
      id: user.id,
      name: user.name,
      email: user.email || null
    };
    // @ts-ignore
    dispatch(setSelectedUser(selectedUser));
  };

  const handleConversationSelect = (conversation: any) => {
    console.log('Selected conversation:', conversation);
    if (conversation.type === 'group') {
      // For group chats, we'll use the group name and ID
      const selectedUser = {
        id: conversation.id,
        name: conversation.name,
        email: null,
        isGroup: true
      };
      // @ts-ignore
      dispatch(setSelectedUser(selectedUser));
    } else {
      // For single chats, find the other participant
      const otherParticipant = conversation.conversation_participants
        .find((p: any) => p.user_id !== currentUserId)?.users;
      
      if (otherParticipant) {
        const selectedUser = {
          id: otherParticipant.id,
          name: otherParticipant.name,
          email: otherParticipant.email
        };
        // @ts-ignore
        dispatch(setSelectedUser(selectedUser));
      }
    }
  };

  return (
    <div className="h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <FolderPlusIcon className="w-4 h-4" />
                <span>Custom Filter</span>
              </button>
              <button className="px-3 py-1.5 text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                Save
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-sm w-32"
                />
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>
              <button className="flex items-center space-x-1 px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <FunnelIcon className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              // For single chats, get the other participant (excluding current user)
              const otherParticipant = conversation.type === 'single' 
                ? conversation.conversation_participants.find((p: any) => p.user_id !== currentUserId)?.users
                : null;

              // For group chats, get unique participants (excluding current user)
              const uniqueParticipants = conversation.type === 'group'
                ? Array.from(
                    new Set(
                      conversation.conversation_participants
                        .filter((p: any) => p.user_id !== currentUserId)
                        .map((p: any) => p.users?.email)
                        .filter(Boolean)
                    )
                  ).map(email => 
                    conversation.conversation_participants.find((p: any) => p.users?.email === email)?.users
                  ).filter(Boolean)
                : [];

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedUser?.id === conversation.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar 
                      name={conversation.type === 'group' 
                        ? conversation.name 
                        : otherParticipant?.name || ''} 
                      size="sm" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.type === 'group' 
                            ? conversation.name 
                            : otherParticipant?.name}
                        </p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(conversation.lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {conversation.type === 'group' 
                            ? `${uniqueParticipants.length} members` 
                            : otherParticipant?.email}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 truncate ml-2 max-w-[200px]">
                            {conversation.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group Chat Modal */}
      {currentUserId && (
        <GroupChatModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          currentUserId={currentUserId}
          users={users}
        />
      )}
    </div>
  );
} 