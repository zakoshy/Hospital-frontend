import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // change if your backend URL differs

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
