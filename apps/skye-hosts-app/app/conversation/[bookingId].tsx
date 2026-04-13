import type {
  IGetMessagesResponseDto,
  IMessageDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { formatShortDateRange } from "@repo/web/format-short-date-range";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { useAuth } from "../contexts/auth-context";
import { useSocket } from "../contexts/socket-context";
import { fetchApi } from "../services/api";
import {
  borderRadius,
  colors,
  commonStyles,
  fontFamily,
  fontWeight,
  spacing,
  typography,
} from "../theme";

export default function ConversationScreen() {
  const router = useRouter();
  const {
    bookingId,
    otherPartyName,
    listingTitle,
    checkInDate,
    checkOutDate,
    bookingStatus,
  } = useLocalSearchParams<{
    bookingId: string;
    otherPartyName: string;
    listingTitle: string;
    checkInDate: string;
    checkOutDate: string;
    bookingStatus: string;
  }>();
  const { user } = useAuth();
  const {
    joinBooking,
    leaveBooking,
    sendMessage,
    markRead,
    onNewMessage,
    onMessagesRead,
  } = useSocket();

  const [messages, setMessages] = useState<IMessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList<IMessageDto>>(null);

  const numericBookingId = Number(bookingId);

  const loadMessages = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchApi<IGetMessagesResponseDto>(
        `/message?bookingId=${bookingId}`,
      );
      setMessages(data.messages.reverse());
    } catch {
      setError("Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Join/leave booking room and subscribe to events
  useEffect(() => {
    joinBooking(numericBookingId);
    markRead(numericBookingId);

    const unsubMessage = onNewMessage((message) => {
      if (message.bookingId !== numericBookingId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [
          ...prev,
          {
            id: message.id,
            bookingId: message.bookingId,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            readAt: null,
            createdAt: message.createdAt,
          },
        ];
      });

      if (message.senderId !== user?.id) {
        markRead(numericBookingId);
      }
    });

    const unsubRead = onMessagesRead((event) => {
      if (event.readByUserId !== user?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user?.id && !m.readAt
              ? { ...m, readAt: new Date() }
              : m,
          ),
        );
      }
    });

    return () => {
      leaveBooking(numericBookingId);
      unsubMessage();
      unsubRead();
    };
  }, [
    numericBookingId,
    user?.id,
    joinBooking,
    leaveBooking,
    markRead,
    onNewMessage,
    onMessagesRead,
  ]);

  const handleSend = useCallback(() => {
    const content = inputText.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      sendMessage(numericBookingId, content);
    } catch {
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, numericBookingId, sendMessage]);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: IMessageDto }) => {
    const isMine = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageBubbleWrapper,
          isMine ? styles.messageSent : styles.messageReceived,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.bubbleSent : styles.bubbleReceived,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.messageTextSent : styles.messageTextReceived,
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isMine ? styles.messageTimeSent : styles.messageTimeReceived,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
            {isMine && item.readAt && (
              <Icon
                source="check-all"
                size={14}
                color={colors.messageSentText}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>
            {otherPartyName ?? "Conversation"}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {checkInDate && checkOutDate
              ? formatShortDateRange(checkInDate, checkOutDate)
              : ""}
            {listingTitle ? ` - ${listingTitle}` : ""}
          </Text>
          {bookingStatus && (
            <View style={styles.headerStatusRow}>
              <View
                style={[
                  styles.headerStatusDot,
                  {
                    backgroundColor:
                      bookingStatus === "confirmed"
                        ? colors.success
                        : bookingStatus === "cancelled"
                          ? colors.danger
                          : colors.warning,
                  },
                ]}
              />
              <Text style={styles.headerStatusText}>
                {bookingStatus === "confirmed"
                  ? "Confirmed"
                  : bookingStatus === "cancelled"
                    ? "Cancelled"
                    : "Requested"}
              </Text>
            </View>
          )}
        </View>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={commonStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading && (
          <View style={commonStyles.centered}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {error && (
          <View style={commonStyles.centered}>
            <Text style={commonStyles.errorText}>{error}</Text>
          </View>
        )}

        {!isLoading && !error && (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Icon
              source="send"
              size={20}
              color={
                inputText.trim() && !isSending
                  ? colors.messageSentText
                  : colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  headerName: {
    fontFamily: fontFamily.heading,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  headerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerStatusText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  messagesContent: {
    padding: spacing.md,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubbleWrapper: {
    marginBottom: spacing.sm,
    flexDirection: "row",
  },
  messageSent: {
    justifyContent: "flex-end",
  },
  messageReceived: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bubbleSent: {
    backgroundColor: colors.messageSent,
    borderBottomRightRadius: borderRadius.xs,
  },
  bubbleReceived: {
    backgroundColor: colors.messageReceived,
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageText: {
    fontSize: typography.md,
  },
  messageTextSent: {
    color: colors.messageSentText,
  },
  messageTextReceived: {
    color: colors.textPrimary,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    marginTop: 2,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeSent: {
    color: colors.messageSentTimestamp,
  },
  messageTimeReceived: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.md,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.messageSent,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.messageReceived,
  },
});
