import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "./platform-url";
import { getToken } from "./token.service";

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  const token = await getToken();
  const baseUrl = getApiBaseUrl();

  socket = io(`${baseUrl}/messaging`, {
    auth: { token },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
