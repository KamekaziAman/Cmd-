import axios from "axios";

export const api = axios.create({ "https://cmdo-isj8.onrender.com/api/commands",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cmdo_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});
