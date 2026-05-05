import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/config';

const MESSAGES_URL = `${API_URL}/messages/`;
let socket;

export const useMessageStore = create((set, get) => ({
  messages: [],
  conversations: [],
  isLoading: false,
  isError: false,
  message: '',

  getConversations: async () => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(MESSAGES_URL + 'conversations', config);
      set({ conversations: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  initSocket: (userId) => {
    if (!socket) {
      const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
      socket = io(socketUrl);
      socket.emit('join', String(userId));

      socket.on('receiveMessage', (message) => {
        set((state) => {
          const exists = state.messages.some(m => m._id === message._id);
          if (exists) return state;
          return { messages: [...state.messages, message] };
        });
      });
    }
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getMessages: async (userId) => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(MESSAGES_URL + userId, config);
      set({ messages: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  sendMessage: async (senderId, receiverId, content) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(MESSAGES_URL, { receiverId, content }, config);
      const newMessage = response.data;

      // Update local state immediately
      set((state) => ({ 
        messages: [...state.messages, { ...newMessage, sender: senderId, receiver: receiverId }] 
      }));

      // Also emit via socket for real-time update to the OTHER user
      if (socket) {
        socket.emit('sendMessage', {
          sender: senderId,
          receiver: receiverId,
          content
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false };
    }
  }
}));
