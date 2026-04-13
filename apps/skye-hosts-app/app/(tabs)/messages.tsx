import type {
  IConversationDto,
  IGetConversationsResponseDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { formatShortDateRange } from "@repo/web/format-short-date-range";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useSocket } from "../contexts/socket-context";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontFamily,
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
  const { onNewMessage, onMessagesRead } = useSocket();
  const [conversations, setConversations] = useState<IConversationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenMessageIds = useRef(new Set<number>());

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
    let isFetchingNewConversation = false;

    const unsubMessage = onNewMessage((message) => {
      if (seenMessageIds.current.has(message.id)) return;
      seenMessageIds.current.add(message.id);

      setConversations((prev) => {
        const exists = prev.some((c) => c.bookingId === message.bookingId);

        if (!exists) {
          if (!isFetchingNewConversation) {
            isFetchingNewConversation = true;
            fetchApi<IGetConversationsResponseDto>("/message/conversations")
              .then((data) => setConversations(data.conversations))
              .catch(() => {})
              .finally(() => {
                isFetchingNewConversation = false;
              });
          }
          return prev;
        }

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

    const unsubRead = onMessagesRead((event) => {
      if (event.readByUserId === user?.id) {
        setConversations((prev) =>
          prev.map((c) =>
            c.bookingId === event.bookingId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      }
    });

    return () => {
      unsubMessage();
      unsubRead();
    };
  }, [user?.id, onNewMessage, onMessagesRead]);

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
              listingTitle: item.listingTitle,
              checkInDate: item.checkInDate,
              checkOutDate: item.checkOutDate,
              bookingStatus: item.bookingStatus,
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
              <Text style={styles.listingTitleInline}>
                {" "}
                · {item.listingTitle}
              </Text>
            </Text>
            <Text style={styles.timeText}>
              {formatRelativeTime(item.lastMessageAt)}
            </Text>
          </View>
          <View style={styles.statusRow}>
            {item.bookingStatus === "confirmed" && (
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            )}
            {item.bookingStatus === "requested" && (
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: colors.warning },
                  ]}
                />
                <Text style={styles.statusText}>Requested</Text>
              </View>
            )}
            {item.bookingStatus === "cancelled" && (
              <View style={styles.statusBadge}>
                <View
                  style={[styles.statusDot, { backgroundColor: colors.danger }]}
                />
                <Text style={styles.statusText}>Cancelled</Text>
              </View>
            )}
            <Text style={styles.listingTitle} numberOfLines={1}>
              {formatShortDateRange(item.checkInDate, item.checkOutDate)} · #
              {item.bookingId}
            </Text>
          </View>
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
          icon="clock-edit-outline"
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
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.md,
    color: colors.textPrimary,
    flex: 1,
  },
  nameTextUnread: {
    fontFamily: fontFamily.heading,
  },
  timeText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  listingTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  listingTitleInline: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: "normal",
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
