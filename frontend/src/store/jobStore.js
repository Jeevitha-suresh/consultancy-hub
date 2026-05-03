import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jobs/';

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useJobStore = create((set, get) => ({
  jobs: [],
  myJobs: [],
  myApplications: [],
  allApplicants: [],
  isLoading: false,
  isError: false,
  message: '',

  getJobs: async (keyword = '') => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL + `?keyword=${keyword}`, getAuthConfig());
      set({ jobs: response.data, isLoading: false, isError: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await axios.post(API_URL, jobData, getAuthConfig());
      set((state) => ({ jobs: [response.data, ...state.jobs], myJobs: [response.data, ...state.myJobs] }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
      return { success: false, message };
    }
  },

  applyJob: async (id, resumeFile = null) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);

      const response = await axios.post(
        API_URL + `${id}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return { success: true, resumeUrl: response.data.resumeUrl };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isError: true, message });
      return { success: false, message };
    }
  },

  // Recruiter: get own posted jobs
  getMyJobs: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL + 'my-jobs', getAuthConfig());
      set({ myJobs: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  updateJob: async (id, data) => {
    try {
      const response = await axios.put(API_URL + id, data, getAuthConfig());
      set((state) => ({
        myJobs: state.myJobs.map((j) => (j._id === id ? response.data : j))
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  },

  deleteJob: async (id) => {
    try {
      await axios.delete(API_URL + id, getAuthConfig());
      set((state) => ({ myJobs: state.myJobs.filter((j) => j._id !== id) }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  },

  // Candidate: get own applied jobs
  getMyApplications: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL + 'my-applications', getAuthConfig());
      set({ myApplications: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  // Recruiter: get all applicants across their jobs
  getAllApplicants: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL + 'all-applicants', getAuthConfig());
      set({ allApplicants: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ isLoading: false, isError: true, message });
    }
  },

  updateApplicantStatus: async (jobId, userId, status) => {
    try {
      await axios.put(API_URL + `${jobId}/applicants/${userId}/status`, { status }, getAuthConfig());
      set((state) => ({
        allApplicants: state.allApplicants.map((a) =>
          a.jobId === jobId && a.user?._id === userId ? { ...a, status } : a
        )
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    }
  }
}));
