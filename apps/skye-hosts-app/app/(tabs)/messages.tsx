import type {
  IConversationDto,
  IGetConversationsResponseDto,
  IWsMessageReadEvent,
  IWsNewMessageEvent,
} from "../../../../packages/skye-hosts-api-client/src";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Badge, Button } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { fetchApi } from "../services/api";
import { disconnectSocket, getSocket } from "../services/socket";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<IConversationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchApi<IGetConversationsResponseDto>(
        "/message/conversations",
      );
      setConversations(data.conversations);
    } catch {
      setError("Failed to load conversations. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let mounted = true;

    async function connectSocket() {
      const socket = await getSocket();

      socket.on("newMessage", (message: IWsNewMessageEvent) => {
        if (!mounted) return;
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.bookingId === message.bookingId
              ? {
                  ...c,
                  lastMessageContent: message.content,
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    message.senderId !== user?.id
                      ? c.unreadCount + 1
                      : c.unreadCount,
                }
              : c,
          );
          return updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          );
        });
      });

      socket.on("messagesRead", (event: IWsMessageReadEvent) => {
        if (!mounted) return;
        if (event.readByUserId === user?.id) {
          setConversations((prev) =>
            prev.map((c) =>
              c.bookingId === event.bookingId ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }
      });
    }

    connectSocket();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const renderConversation = ({ item }: { item: IConversationDto }) => {
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationRow}
        onPress={() => {
          setConversations((prev) =>
            prev.map((c) =>
              c.bookingId === item.bookingId ? { ...c, unreadCount: 0 } : c,
            ),
          );
          router.push({
            pathname: "/conversation/[bookingId]",
            params: {
              bookingId: item.bookingId,
              otherPartyName: item.otherPartyName,
            },
          });
        }}
      >
        <View style={styles.conversationContent}>
          <View style={commonStyles.row}>
            <Text
              style={[styles.nameText, hasUnread && styles.nameTextUnread]}
              numberOfLines={1}
            >
              {item.otherPartyName}
            </Text>
            <Text style={styles.timeText}>
              {formatRelativeTime(item.lastMessageAt)}
            </Text>
          </View>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.listingTitle} · #{item.bookingId}
          </Text>
          <View style={commonStyles.row}>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {item.lastMessageContent}
            </Text>
            {hasUnread && (
              <Badge style={styles.badge}>{item.unreadCount}</Badge>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Messages" />
        <Appbar.Action
          icon="cog"
          onPress={() => router.push("/message-templates")}
        />
      </Appbar.Header>

      {isLoading && (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={loadConversations}>
            Retry
          </Button>
        </View>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.emptyText}>No messages yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Messages from guests will appear here.
          </Text>
        </View>
      )}

      {!isLoading && !error && conversations.length > 0 && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.bookingId)}
          renderItem={renderConversation}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: spacing.sm,
  },
  conversationRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  conversationContent: {
    gap: spacing.xs,
  },
  nameText: {
    fontSize: typography.md,
    color: colors.textPrimary,
    flex: 1,
  },
  nameTextUnread: {
    fontWeight: fontWeight.bold,
  },
  timeText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  listingTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  lastMessageText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  badge: {
    marginLeft: spacing.sm,
  },
});
