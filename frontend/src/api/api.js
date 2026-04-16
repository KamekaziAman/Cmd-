import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "https://cmdo-isj8.onrender.com/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cmdo_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});
