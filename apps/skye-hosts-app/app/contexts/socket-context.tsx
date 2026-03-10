import type {
  IWsMessageReadEvent,
  IWsNewMessageEvent,
} from "../../../../packages/skye-hosts-api-client/src";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "../services/platform-url";
import { ensureValidToken } from "../services/session.service";
import { getToken } from "../services/token.service";
import { isTokenExpired } from "../services/token-utils.service";
import { useAuth } from "./auth-context";

type NewMessageHandler = (event: IWsNewMessageEvent) => void;
type MessagesReadHandler = (event: IWsMessageReadEvent) => void;

interface SocketContextValue {
  getSocket: () => Socket | null;
  joinBooking: (bookingId: number) => void;
  leaveBooking: (bookingId: number) => void;
  sendMessage: (bookingId: number, content: string) => void;
  markRead: (bookingId: number) => void;
  onNewMessage: (handler: NewMessageHandler) => () => void;
  onMessagesRead: (handler: MessagesReadHandler) => () => void;
}

const SocketContext = createContext<SocketContextValue>({
  getSocket: () => null,
  joinBooking: () => {},
  leaveBooking: () => {},
  sendMessage: () => {},
  markRead: () => {},
  onNewMessage: () => () => {},
  onMessagesRead: () => () => {},
});

async function getFreshToken(): Promise<string | null> {
  const token = await getToken();
  if (token && isTokenExpired(token)) {
    const refreshed = await ensureValidToken();
    if (!refreshed) return null;
    return getToken();
  }
  return token;
}

const TOKEN_CHECK_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const newMessageHandlers = useRef<Set<NewMessageHandler>>(new Set());
  const messagesReadHandlers = useRef<Set<MessagesReadHandler>>(new Set());

  // Connect socket when authenticated, disconnect when not
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    let disposed = false;

    async function connect() {
      const token = await getFreshToken();
      if (disposed || !token) return;

      const baseUrl = getApiBaseUrl();
      const socket = io(`${baseUrl}/messaging`, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      socketRef.current = socket;

      // Refresh token before each reconnection attempt
      socket.io.on("reconnect_attempt", async () => {
        const freshToken = await getFreshToken();
        if (freshToken && socketRef.current === socket) {
          socket.auth = { token: freshToken };
        }
      });

      // Dispatch events to registered handlers
      socket.on("newMessage", (event: IWsNewMessageEvent) => {
        for (const handler of newMessageHandlers.current) {
          handler(event);
        }
      });

      socket.on("messagesRead", (event: IWsMessageReadEvent) => {
        for (const handler of messagesReadHandlers.current) {
          handler(event);
        }
      });
    }

    connect();

    return () => {
      disposed = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Periodic token refresh to prevent expiry while connected
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const token = await getToken();
      if (token && isTokenExpired(token)) {
        const freshToken = await getFreshToken();
        if (freshToken && socketRef.current) {
          socketRef.current.auth = { token: freshToken };
          // Reconnect with fresh token
          socketRef.current.disconnect().connect();
        }
      }
    }, TOKEN_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Reconnect when app comes back to foreground
  useEffect(() => {
    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === "active" && isAuthenticated) {
        const socket = socketRef.current;
        if (socket && !socket.connected) {
          const freshToken = await getFreshToken();
          if (freshToken) {
            socket.auth = { token: freshToken };
            socket.connect();
          }
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [isAuthenticated]);

  const getSocketValue = useCallback(() => socketRef.current, []);

  const joinBooking = useCallback((bookingId: number) => {
    socketRef.current?.emit("joinBooking", { bookingId });
  }, []);

  const leaveBooking = useCallback((bookingId: number) => {
    socketRef.current?.emit("leaveBooking", { bookingId });
  }, []);

  const sendMessage = useCallback((bookingId: number, content: string) => {
    socketRef.current?.emit("sendMessage", { bookingId, content });
  }, []);

  const markRead = useCallback((bookingId: number) => {
    socketRef.current?.emit("markRead", { bookingId });
  }, []);

  const onNewMessage = useCallback((handler: NewMessageHandler) => {
    newMessageHandlers.current.add(handler);
    return () => {
      newMessageHandlers.current.delete(handler);
    };
  }, []);

  const onMessagesRead = useCallback((handler: MessagesReadHandler) => {
    messagesReadHandlers.current.add(handler);
    return () => {
      messagesReadHandlers.current.delete(handler);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        getSocket: getSocketValue,
        joinBooking,
        leaveBooking,
        sendMessage,
        markRead,
        onNewMessage,
        onMessagesRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
