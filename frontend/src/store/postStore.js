import { create } from 'zustand';
import axios from 'axios';
import { API_URL as BASE_API_URL } from '../utils/config';

const API_URL = `${BASE_API_URL}/posts/`;


export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  isError: false,
  message: '',

  getPosts: async () => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      set({ posts: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  createPost: async (postData) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL, postData, config);
      set((state) => ({ posts: [response.data, ...state.posts] }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  },

  deletePost: async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_URL + id, config);
      set((state) => ({ posts: state.posts.filter((post) => post._id !== id) }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  },

  toggleLike: async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(API_URL + `${id}/like`, {}, config);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === id ? { ...post, likes: response.data } : post
        ),
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  },

  addComment: async (id, text) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL + `${id}/comment`, { text }, config);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === id ? { ...post, comments: response.data } : post
        ),
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  }
}));
