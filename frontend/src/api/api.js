import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cmdo_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});
