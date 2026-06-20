import axios from "axios";

const defaultApiBaseUrl = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api/"
  : "https://cmdo-isj8.onrender.com/api/";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cmdo_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});
