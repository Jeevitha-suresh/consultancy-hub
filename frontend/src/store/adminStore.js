import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/';
const AUTH_URL = 'http://localhost:5000/api/auth/';

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useAdminStore = create((set) => ({
  users: [],
  recruiters: [],
  isLoading: false,
  isError: false,
  message: '',
  successMessage: '',

  getUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL + 'users', getAuthConfig());
      set({ users: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(API_URL + `users/${id}`, getAuthConfig());
      set((state) => ({ users: state.users.filter((u) => u._id !== id) }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  },

  getRecruiters: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL + 'recruiters', getAuthConfig());
      set({ recruiters: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  createRecruiter: async (data) => {
    try {
      const response = await axios.post(API_URL + 'recruiters', data, getAuthConfig());
      set((state) => ({ recruiters: [...state.recruiters, response.data] }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  },

  resetRecruiterPassword: async (id, newPassword) => {
    try {
      const response = await axios.put(API_URL + `recruiter/${id}/reset-password`, { newPassword }, getAuthConfig());
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  },

  adminChangePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(AUTH_URL + 'change-password', { currentPassword, newPassword }, getAuthConfig());
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  },

  // For recruiters to change their own password on forced change
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(AUTH_URL + 'change-password', { currentPassword, newPassword }, getAuthConfig());
      // Update localStorage to clear mustChangePassword flag
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, mustChangePassword: false }));
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  }
}));
