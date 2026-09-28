import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1", // Proxied seamlessly by Next.js rewrites
  withCredentials: true,
});