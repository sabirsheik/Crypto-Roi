// src/services/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:9000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // adjust to how your auth token is stored (localStorage or context)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
