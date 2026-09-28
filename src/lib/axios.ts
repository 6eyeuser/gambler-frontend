import axios from "axios";

export const api = axios.create({
  baseURL: "https://gambler-backend-production-b2fe.up.railway.app",
  withCredentials: true, // CRITICAL: This tells the browser to attach your HttpOnly cookie across domains
});