import { create } from 'zustand';
import api from '../config/api';

const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  loading: false,

  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
  },

  fetchChats: async () => {
    try {
      const res = await api.get("/chats");
      set({ chats: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Fetch chats error:", error);
    }
  },

  fetchMessages: async (chatId) => {
    if (!chatId) return;
    set({ loading: true });
    try {
      const res = await api.get(`/messages/${chatId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Fetch messages error:", error);
      set({ loading: false });
    }
  },

  sendMessage: async (content, chatId, attachments = [], replyTo = null) => {
    try {
      const res = await api.post("/messages", {
        content,
        chatId,
        attachments,
        replyTo
      });
      get().addMessage(res.data);
      return res.data;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  updateMessageStatus: (messageId, status, userId) => {
    set((state) => ({
      messages: state.messages.map(msg => {
        if (msg._id === messageId) {
          if (status === 'delivered') {
            const exists = msg.deliveredTo?.some(d => d.userId === userId);
            if (!exists) return { ...msg, deliveredTo: [...(msg.deliveredTo || []), { userId, at: new Date() }] };
          } else if (status === 'read') {
            const exists = msg.readBy?.some(r => r.userId === userId);
            if (!exists) return { ...msg, readBy: [...(msg.readBy || []), { userId, at: new Date() }] };
          }
        }
        return msg;
      })
    }));
  },

  accessChat: async (userId) => {
    try {
      const res = await api.post("/chats", { userId });
      
      const chats = get().chats;
      if (!chats.find((c) => c._id === res.data._id)) {
        set({ chats: [res.data, ...chats] });
      }
      set({ selectedChat: res.data });
      return res.data;
    } catch (error) {
      console.error("Access chat error:", error);
      throw error;
    }
  },
  
  createGroup: async (name, users) => {
    try {
      const res = await api.post("/chats/group", { name, users: JSON.stringify(users.map(u => u._id)) });
      set((state) => ({ chats: [res.data, ...state.chats] }));
      return res.data;
    } catch (error) {
       console.error("Create group error:", error);
       throw error;
    }
  }
}));

export default useChatStore;


