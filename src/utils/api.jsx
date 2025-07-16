const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

import axios from "axios";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
