import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/connections/';

export const useConnectionStore = create((set, get) => ({
  connections: [],
  requests: [],
  isLoading: false,
  isError: false,
  message: '',

  getConnections: async () => {
    set({ isLoading: true });
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      set({ 
        connections: response.data.connections, 
        requests: response.data.requests, 
        isLoading: false, 
        isError: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  sendRequest: async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(API_URL + `request/${id}`, {}, config);
      // We don't automatically add to connections/requests since we just sent it.
      // Can refresh or show toast
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  },

  acceptRequest: async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(API_URL + `accept/${id}`, {}, config);
      
      // Update local state by moving from requests to connections
      const { requests, connections } = get();
      const acceptedUser = requests.find(r => r._id === id);
      set({
        requests: requests.filter(r => r._id !== id),
        connections: [...connections, acceptedUser]
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  },

  rejectRequest: async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(API_URL + `reject/${id}`, {}, config);
      
      const { requests } = get();
      set({
        requests: requests.filter(r => r._id !== id)
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
    }
  }
}));
