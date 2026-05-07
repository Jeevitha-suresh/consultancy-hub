const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;

export { API_URL, BASE_URL };

