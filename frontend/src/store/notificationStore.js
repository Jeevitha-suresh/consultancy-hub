import { create } from 'zustand';
import axios from 'axios';
import { API_URL as BASE_API_URL } from '../utils/config';

const API_URL = `${BASE_API_URL}/notifications/`;


const getConfig = () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isError: false,

  getNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL, getConfig());
      set({ notifications: response.data, isLoading: false, isError: false });
    } catch (error) {
      set({ isLoading: false, isError: true });
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axios.get(API_URL + 'count', getConfig());
      set({ unreadCount: response.data.count });
    } catch (_) {
      // silently fail — don't crash the app
    }
  },

  markAllRead: async () => {
    try {
      await axios.put(API_URL + 'read', {}, getConfig());
      set((state) => ({
        unreadCount: 0,
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      }));
    } catch (_) {}
  }
}));
