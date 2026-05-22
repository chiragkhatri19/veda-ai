'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('Socket.IO client cannot be used on the server');
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000', {
      autoConnect: false,
      transports: ['websocket'],
    });
  }

  return socket;
}

export function subscribeToAssignment(id: string): void {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('subscribe:assignment', id);
}

export function unsubscribeFromAssignment(id: string): void {
  if (!socket?.connected) return;
  socket.emit('unsubscribe:assignment', id);
}

export { getSocket };
