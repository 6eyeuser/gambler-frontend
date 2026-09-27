// src/lib/socket.ts
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // We will manually connect when the user loads the page
});