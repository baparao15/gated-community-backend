import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(token) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    const instance = io('/', { auth: { token }, transports: ['websocket'] });
    setSocket(instance);
    return () => instance.disconnect();
  }, [token]);

  return socket;
}
