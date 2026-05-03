import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(API_URL + 'register', userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      set({ user: response.data, isLoading: false, isSuccess: true });
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      set({ isLoading: false, isError: true, message });
    }
  },

  login: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(API_URL + 'login', userData);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      set({ user: response.data, isLoading: false, isSuccess: true });
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      set({ isLoading: false, isError: true, message });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },

  reset: () => set({ isLoading: false, isError: false, isSuccess: false, message: '' })
}));
