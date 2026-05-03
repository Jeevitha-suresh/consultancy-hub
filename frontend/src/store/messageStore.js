import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api/messages/';
let socket;

export const useMessageStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  isError: false,
  message: '',

  initSocket: (userId) => {
    if (!socket) {
      socket = io('http://localhost:5000');
      socket.emit('join', userId);

      socket.on('receiveMessage', (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
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
      const response = await axios.get(API_URL + userId, config);
      set({ messages: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  sendMessage: (senderId, receiverId, content) => {
    if (socket) {
      socket.emit('sendMessage', {
        sender: senderId,
        receiver: receiverId,
        content
      });
    }
  }
}));
