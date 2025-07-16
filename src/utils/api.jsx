const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
