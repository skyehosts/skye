import type { IGetConversationsResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "./auth-context";
import { useSocket } from "./socket-context";
import { fetchApi } from "../services/api";

interface UnreadMessagesContextValue {
  hasUnread: boolean;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  hasUnread: false,
});

export function UnreadMessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const { onNewMessage, onMessagesRead } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const hasFetched = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await fetchApi<IGetConversationsResponseDto>(
        "/message/conversations",
      );
      const total = data.conversations.reduce(
        (sum, c) => sum + c.unreadCount,
        0,
      );
      setUnreadCount(total);
    } catch {
      // silently fail — badge just won't show
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      hasFetched.current = false;
      return;
    }
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Refresh when app comes back to foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active" && isAuthenticated) {
        fetchUnreadCount();
      }
    };
    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [isAuthenticated, fetchUnreadCount]);

  // Listen to socket events
  useEffect(() => {
    const unsubMessage = onNewMessage((message) => {
      if (message.senderId !== user?.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    const unsubRead = onMessagesRead((event) => {
      if (event.readByUserId === user?.id) {
        // Refetch to get accurate count after marking read
        fetchUnreadCount();
      }
    });

    return () => {
      unsubMessage();
      unsubRead();
    };
  }, [user?.id, onNewMessage, onMessagesRead, fetchUnreadCount]);

  return (
    <UnreadMessagesContext.Provider value={{ hasUnread: unreadCount > 0 }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
