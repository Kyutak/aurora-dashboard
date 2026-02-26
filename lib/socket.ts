import { io } from 'socket.io-client'

const SOCKET_URL = 'https://aurora-api-095s.onrender.com';

export const socket = io(SOCKET_URL, {
    autoConnect: true, 
    withCredentials: true,
    transports: ['websocket', 'polling'], 
    reconnection: true,
    reconnectionAttempts: 5
})