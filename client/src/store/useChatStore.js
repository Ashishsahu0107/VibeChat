import { create } from 'zustand';
import api from '../config/api';

const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  messagesPagination: { page: 1, total: 0, hasMore: false },

  // ── Selected Chat ──────────────────────────────────────────────────────────
  setSelectedChat: (chat) => {
    set({ selectedChat: chat, messages: [], messagesPagination: { page: 1, total: 0, hasMore: false } });
  },

  // ── Fetch Chats ────────────────────────────────────────────────────────────
  fetchChats: async () => {
    try {
      const res = await api.get('/chats');
      set({ chats: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error('Fetch chats error:', error);
    }
  },

  // ── Fetch Messages (paginated) ─────────────────────────────────────────────
  fetchMessages: async (chatId, page = 1) => {
    if (!chatId) return;
    set({ messagesLoading: true });
    try {
      const res = await api.get(`/messages/${chatId}`, { params: { page, limit: 50 } });
      const { messages, total, limit } = res.data;
      const sortedMessages = Array.isArray(messages) ? messages : [];
      
      if (page === 1) {
        set({
          messages: sortedMessages,
          messagesLoading: false,
          messagesPagination: {
            page,
            total,
            hasMore: sortedMessages.length < total,
          },
        });
      } else {
        set((state) => ({
          messages: [...sortedMessages, ...state.messages],
          messagesLoading: false,
          messagesPagination: {
            page,
            total,
            hasMore: (page * limit) < total,
          },
        }));
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({ messagesLoading: false });
    }
  },

  loadMoreMessages: async () => {
    const { selectedChat, messagesPagination } = get();
    if (!selectedChat || !messagesPagination.hasMore) return;
    await get().fetchMessages(selectedChat._id, messagesPagination.page + 1);
  },

  // ── Upload Attachment ──────────────────────────────────────────────────────
  uploadAttachment: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/messages/upload/file', formData);
      return res.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // ── Send Message ───────────────────────────────────────────────────────────
  sendMessage: async (content, chatId, attachments = [], replyTo = null, isForwarded = false) => {
    try {
      const res = await api.post('/messages', {
        content,
        chatId,
        attachments,
        replyTo: replyTo?._id || null,
        isForwarded,
      });
      get().addMessage(res.data);
      // Update chat's latestMessage
      set((state) => ({
        chats: state.chats.map((c) =>
          c._id === chatId ? { ...c, latestMessage: res.data, updatedAt: new Date() } : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      }));
      return res.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // ── Add Message (from socket) ──────────────────────────────────────────────
  addMessage: (message) => {
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m._id === message._id)) return {};
      return { messages: [...state.messages, message] };
    });
  },

  // ── Edit Message ───────────────────────────────────────────────────────────
  editMessage: async (messageId, content) => {
    try {
      const res = await api.put(`/messages/${messageId}/edit`, { content });
      set((state) => ({
        messages: state.messages.map((m) => m._id === messageId ? res.data : m),
      }));
      return res.data;
    } catch (error) {
      console.error('Edit message error:', error);
      throw error;
    }
  },

  updateEditedMessage: (message) => {
    set((state) => ({
      messages: state.messages.map((m) => m._id === message._id ? message : m),
    }));
  },

  // ── Delete Message ─────────────────────────────────────────────────────────
  deleteMessage: async (messageId, forEveryone = false) => {
    try {
      const res = await api.delete(`/messages/${messageId}`, { data: { forEveryone } });
      if (forEveryone) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === messageId
              ? { ...m, content: 'This message was deleted', attachments: [], isDeleted: true }
              : m
          ),
        }));
      } else {
        set((state) => ({
          messages: state.messages.filter((m) => m._id !== messageId),
        }));
      }
      return res.data;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },

  handleMessageDeleted: ({ messageId, forEveryone }) => {
    if (forEveryone) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? { ...m, content: 'This message was deleted', attachments: [], isDeleted: true }
            : m
        ),
      }));
    } else {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    }
  },

  // ── React to Message ───────────────────────────────────────────────────────
  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await api.post(`/messages/${messageId}/react`, { emoji });
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, reactions: res.data.reactions } : m
        ),
      }));
    } catch (error) {
      console.error('React to message error:', error);
    }
  },

  handleReaction: ({ messageId, reactions }) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      ),
    }));
  },

  // ── Star Message ───────────────────────────────────────────────────────────
  starMessage: async (messageId) => {
    try {
      const res = await api.post(`/messages/${messageId}/star`);
      return res.data;
    } catch (error) {
      console.error('Star message error:', error);
    }
  },

  // ── Update Message Status ──────────────────────────────────────────────────
  updateMessageStatus: (messageId, status, userId) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg._id !== messageId) return msg;
        if (status === 'delivered') {
          const exists = msg.deliveredTo?.some((d) => d.userId === userId);
          if (!exists) return { ...msg, deliveredTo: [...(msg.deliveredTo || []), { userId, at: new Date() }], status: 'delivered' };
        } else if (status === 'read') {
          const exists = msg.readBy?.some((r) => r.userId === userId);
          if (!exists) return { ...msg, readBy: [...(msg.readBy || []), { userId, at: new Date() }], status: 'read' };
        }
        return msg;
      }),
    }));
  },

  // ── Mark As Read ───────────────────────────────────────────────────────────
  markAsRead: async (chatId) => {
    try {
      await api.post(`/messages/${chatId}/read`);
      // Reset unread count in chat list
      set((state) => ({
        chats: state.chats.map((c) => {
          if (c._id !== chatId) return c;
          const userStates = (c.userStates || []).map((s) =>
            String(s.userId?._id || s.userId) === String(state.authUser?._id) ? { ...s, unreadCount: 0 } : s
          );
          return { ...c, userStates };
        }),
      }));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  // ── Search Messages ────────────────────────────────────────────────────────
  searchMessages: async (chatId, query) => {
    try {
      const res = await api.get(`/messages/${chatId}/search`, { params: { q: query } });
      return res.data;
    } catch (error) {
      console.error('Search messages error:', error);
      return [];
    }
  },

  // ── Access Chat ────────────────────────────────────────────────────────────
  accessChat: async (userId) => {
    try {
      const res = await api.post('/chats', { userId });
      set((state) => {
        const exists = state.chats.find((c) => c._id === res.data._id);
        return {
          chats: exists ? state.chats : [res.data, ...state.chats],
          selectedChat: res.data,
        };
      });
      return res.data;
    } catch (error) {
      console.error('Access chat error:', error);
      throw error;
    }
  },

  // ── Create Group ───────────────────────────────────────────────────────────
  createGroup: async (name, users, description = '') => {
    try {
      const res = await api.post('/chats/group', {
        name,
        users: JSON.stringify(users.map((u) => u._id)),
        description,
      });
      set((state) => ({ chats: [res.data, ...state.chats] }));
      return res.data;
    } catch (error) {
      console.error('Create group error:', error);
      throw error;
    }
  },

  // ── Update Chat State (pin, mute, archive, clear) ──────────────────────────
  updateChatState: async (chatId, stateData) => {
    try {
      await api.put(`/chats/${chatId}/state`, stateData);
      await get().fetchChats(); // Refresh
    } catch (error) {
      console.error('Update chat state error:', error);
      throw error;
    }
  },

  // ── Delete Chat ────────────────────────────────────────────────────────────
  deleteChat: async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`);
      set((state) => ({
        chats: state.chats.filter((c) => c._id !== chatId),
        selectedChat: state.selectedChat?._id === chatId ? null : state.selectedChat,
        messages: state.selectedChat?._id === chatId ? [] : state.messages,
      }));
    } catch (error) {
      console.error('Delete chat error:', error);
      throw error;
    }
  },

  // ── Group Actions ──────────────────────────────────────────────────────────
  addToGroup: async (chatId, userId) => {
    try {
      const res = await api.put('/chats/groupadd', { chatId, userId });
      set((state) => ({
        chats: state.chats.map((c) => c._id === chatId ? res.data : c),
        selectedChat: state.selectedChat?._id === chatId ? res.data : state.selectedChat,
      }));
      return res.data;
    } catch (error) {
      console.error('Add to group error:', error);
      throw error;
    }
  },

  removeFromGroup: async (chatId, userId) => {
    try {
      const res = await api.put('/chats/groupremove', { chatId, userId });
      set((state) => ({
        chats: state.chats.map((c) => c._id === chatId ? res.data : c),
        selectedChat: state.selectedChat?._id === chatId ? res.data : state.selectedChat,
      }));
      return res.data;
    } catch (error) {
      console.error('Remove from group error:', error);
      throw error;
    }
  },

  makeAdmin: async (chatId, userId) => {
    try {
      const res = await api.put('/chats/makeadmin', { chatId, userId });
      set((state) => ({
        chats: state.chats.map((c) => c._id === chatId ? res.data : c),
        selectedChat: state.selectedChat?._id === chatId ? res.data : state.selectedChat,
      }));
      return res.data;
    } catch (error) {
      console.error('Make admin error:', error);
      throw error;
    }
  },

  renameGroup: async (chatId, chatName, description) => {
    try {
      const res = await api.put('/chats/rename', { chatId, chatName, description });
      set((state) => ({
        chats: state.chats.map((c) => c._id === chatId ? res.data : c),
        selectedChat: state.selectedChat?._id === chatId ? res.data : state.selectedChat,
      }));
      return res.data;
    } catch (error) {
      console.error('Rename group error:', error);
      throw error;
    }
  },

  // ── Handle socket group-updated event ─────────────────────────────────────
  handleGroupUpdated: (updatedChat) => {
    set((state) => ({
      chats: state.chats.map((c) => c._id === updatedChat._id ? updatedChat : c),
      selectedChat: state.selectedChat?._id === updatedChat._id ? updatedChat : state.selectedChat,
    }));
  },

  handleGroupCreated: (newGroup) => {
    set((state) => {
      const exists = state.chats.find((c) => c._id === newGroup._id);
      return exists ? {} : { chats: [newGroup, ...state.chats] };
    });
  },

  // ── Update Unread Count ────────────────────────────────────────────────────
  incrementUnread: (chatId) => {
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c._id !== chatId) return c;
        return c; // Server handles unread
      }),
    }));
  },

  updateLatestMessage: (chatId, message) => {
    set((state) => ({
      chats: state.chats
        .map((c) => c._id === chatId ? { ...c, latestMessage: message, updatedAt: new Date() } : c)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    }));
  },
}));

export default useChatStore;
