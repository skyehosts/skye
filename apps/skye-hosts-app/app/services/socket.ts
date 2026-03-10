import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "./platform-url";
import { ensureValidToken } from "./session.service";
import { getToken } from "./token.service";
import { isTokenExpired } from "./token-utils.service";

let socket: Socket | null = null;

async function getFreshToken(): Promise<string | null> {
  const token = await getToken();
  if (token && isTokenExpired(token)) {
    const refreshed = await ensureValidToken();
    if (!refreshed) return null;
    return getToken();
  }
  return token;
}

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  const token = await getFreshToken();
  const baseUrl = getApiBaseUrl();

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(`${baseUrl}/messaging`, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  // Before each reconnection attempt, refresh the token so we don't
  // reconnect with a stale JWT that the server will reject.
  socket.io.on("reconnect_attempt", async () => {
    const freshToken = await getFreshToken();
    if (freshToken && socket) {
      socket.auth = { token: freshToken };
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
