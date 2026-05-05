import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/users/';

export const useUserStore = create((set, get) => ({
  profile: null,
  users: [],
  isLoading: false,
  isError: false,
  message: '',

  getProfile: async (id) => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(API_URL + id, config);
      set({ profile: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      set({ isLoading: false, isError: true, message });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // let axios set content-type for FormData automatically
        },
      };
      const response = await axios.put(API_URL + 'profile', profileData, config);
      set({ profile: response.data, isLoading: false, isError: false });
      
      // Update local storage user data to match new profile
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      useAuthStore.getState().setUser(updatedUser);

    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      set({ isLoading: false, isError: true, message });
    }
  },

  searchUsers: async (keyword = '') => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(API_URL + `?keyword=${keyword}`, config);
      set({ users: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      set({ isLoading: false, isError: true, message });
    }
  }
}));
