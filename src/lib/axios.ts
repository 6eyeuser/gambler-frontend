import axios from "axios";

export const api = axios.create({
  baseURL: "https://gambler-backend-production-b2fe.up.railway.app/api/v1",
  withCredentials: true, // Forces browser to attach the HttpOnly cookie
});

// Interceptor to attach Authorization Bearer token from localStorage as a fallback
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});