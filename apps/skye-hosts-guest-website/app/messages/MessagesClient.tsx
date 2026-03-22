'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import {
  Badge,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { formatShortDateRange } from '@repo/web/format-short-date-range';
import { useAuth } from '@repo/web/use-auth';
import * as Sentry from '@sentry/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
  IConversationDto,
  IGetConversationsResponseDto,
  IGetMessagesResponseDto,
  IMessageDto,
  IWsMessageReadEvent,
  IWsNewMessageEvent,
} from '../../../../packages/skye-hosts-api-client/src';
import { getApiBaseUrl } from '../../../../packages/skye-hosts-api-client/src';

export default function MessagesClient() {
  const { apiToken, user, authFetch } = useAuth();
  const isDesktop = useMediaQuery('(min-width:768px)');
  const userId = user?.id ? Number(user.id) : null;

  const [conversations, setConversations] = useState<IConversationDto[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [messages, setMessages] = useState<IMessageDto[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevBookingIdRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!apiToken) return;

    const fetchConversations = async () => {
      try {
        const res = await authFetch(
          `${getApiBaseUrl()}/message/conversations`,
          {
            headers: { Authorization: `Bearer ${apiToken}` },
          },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          payload: IGetConversationsResponseDto;
        };
        setConversations(data.payload.conversations);
        const first = data.payload.conversations[0];
        if (first) {
          setSelectedBookingId((prev) => prev ?? first.bookingId);
        }
      } finally {
        setLoadingConversations(false);
      }
    };

    void fetchConversations();
  }, [apiToken]);

  // Socket connection
  useEffect(() => {
    if (!apiToken) return;

    const socket = io(`${getApiBaseUrl()}/messaging`, {
      auth: { token: apiToken },
    });

    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      Sentry.captureException(err, { tags: { component: 'messaging-ws' } });
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect' || reason === 'transport error') {
        Sentry.captureMessage(`WebSocket disconnected: ${reason}`, {
          level: 'warning',
          tags: { component: 'messaging-ws' },
        });
      }
    });

    socket.io.on('reconnect_failed', () => {
      Sentry.captureMessage('WebSocket reconnection failed', {
        level: 'error',
        tags: { component: 'messaging-ws' },
      });
    });

    const seenMessageIds = new Set<number>();
    let isFetchingNewConversation = false;

    socket.on('newMessage', (event: IWsNewMessageEvent) => {
      if (seenMessageIds.has(event.id)) return;
      seenMessageIds.add(event.id);

      // Update conversation list
      setConversations((prev) => {
        const exists = prev.some((c) => c.bookingId === event.bookingId);

        if (!exists) {
          if (!isFetchingNewConversation) {
            isFetchingNewConversation = true;
            authFetch(`${getApiBaseUrl()}/message/conversations`, {
              headers: { Authorization: `Bearer ${apiToken}` },
            })
              .then((res) => (res.ok ? res.json() : null))
              .then(
                (data: { payload: IGetConversationsResponseDto } | null) => {
                  if (data) {
                    setConversations(data.payload.conversations);
                  }
                },
              )
              .catch(() => {})
              .finally(() => {
                isFetchingNewConversation = false;
              });
          }
          return prev;
        }

        return prev
          .map((c) =>
            c.bookingId === event.bookingId
              ? {
                  ...c,
                  lastMessageContent: event.content,
                  lastMessageAt: event.createdAt,
                  unreadCount:
                    event.senderId !== userId
                      ? c.unreadCount + 1
                      : c.unreadCount,
                }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          );
      });

      // Append to messages if viewing this conversation
      setSelectedBookingId((currentBookingId) => {
        if (currentBookingId === event.bookingId) {
          const newMsg: IMessageDto = {
            id: event.id,
            bookingId: event.bookingId,
            senderId: event.senderId,
            senderName: event.senderName,
            content: event.content,
            readAt: null,
            createdAt: event.createdAt,
          };
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
          );

          // Mark as read if from other party
          if (event.senderId !== userId) {
            socket.emit('markRead', { bookingId: event.bookingId });
            setConversations((prev) =>
              prev.map((c) =>
                c.bookingId === event.bookingId ? { ...c, unreadCount: 0 } : c,
              ),
            );
          }
        }
        return currentBookingId;
      });
    });

    socket.on('messagesRead', (event: IWsMessageReadEvent) => {
      if (event.readByUserId !== userId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.bookingId === event.bookingId &&
            m.senderId === userId &&
            !m.readAt
              ? { ...m, readAt: new Date() }
              : m,
          ),
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiToken, userId]);

  // Fetch messages and join/leave rooms on conversation change
  useEffect(() => {
    if (!apiToken || selectedBookingId === null) return;

    const socket = socketRef.current;

    // Leave previous room
    if (prevBookingIdRef.current !== null && socket) {
      socket.emit('leaveBooking', { bookingId: prevBookingIdRef.current });
    }
    prevBookingIdRef.current = selectedBookingId;

    // Always clear unread badge when opening a conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.bookingId === selectedBookingId ? { ...c, unreadCount: 0 } : c,
      ),
    );

    // Join new room — wait for connection if not yet connected
    if (socket) {
      const joinRoom = () => {
        socket.emit(
          'joinBooking',
          { bookingId: selectedBookingId },
          (ack: { success: boolean; error?: string }) => {
            if (!ack?.success) {
              Sentry.captureMessage(
                `joinBooking failed: ${ack?.error ?? 'unknown'}`,
                { level: 'error', tags: { component: 'messaging-ws' } },
              );
            }
          },
        );
        socket.emit('markRead', { bookingId: selectedBookingId });
      };

      if (socket.connected) {
        joinRoom();
      } else {
        socket.once('connect', joinRoom);
      }
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await authFetch(
          `${getApiBaseUrl()}/message?bookingId=${selectedBookingId}`,
          { headers: { Authorization: `Bearer ${apiToken}` } },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { payload: IGetMessagesResponseDto };
        const sorted = [...data.payload.messages].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setMessages(sorted);
      } finally {
        setLoadingMessages(false);
      }
    };

    void fetchMessages();
  }, [apiToken, selectedBookingId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    if (!inputText.trim() || selectedBookingId === null || !socketRef.current)
      return;
    socketRef.current.emit(
      'sendMessage',
      { bookingId: selectedBookingId, content: inputText.trim() },
      (ack: { success: boolean; error?: string }) => {
        if (!ack?.success) {
          Sentry.captureMessage(
            `sendMessage failed: ${ack?.error ?? 'unknown'}`,
            { level: 'error', tags: { component: 'messaging-ws' } },
          );
        }
      },
    );
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    confirmed: { color: 'success.main', label: 'Confirmed' },
    requested: { color: 'warning.main', label: 'Requested' },
    cancelled: { color: 'error.main', label: 'Cancelled' },
  };

  const statusBadge = (status: string) => {
    const config = statusConfig[status];
    if (!config) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: config.color,
            flexShrink: 0,
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {config.label}
        </Typography>
      </Box>
    );
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const selectedConversation = conversations.find(
    (c) => c.bookingId === selectedBookingId,
  );

  const conversationList = (
    <Box
      sx={{
        width: isDesktop ? 350 : '100%',
        borderRight: isDesktop ? '1px solid' : 'none',
        borderColor: 'divider',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Messages</Typography>
      </Box>

      {loadingConversations ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : conversations.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No conversations yet</Typography>
        </Box>
      ) : (
        conversations.map((conv) => (
          <Box
            key={conv.bookingId}
            onClick={() => setSelectedBookingId(conv.bookingId)}
            sx={{
              p: 2,
              cursor: 'pointer',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor:
                selectedBookingId === conv.bookingId
                  ? 'action.selected'
                  : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
            >
              <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                {conv.otherPartyName}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 0.75 }}
                >
                  · {conv.listingTitle}
                </Typography>
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                {formatTime(conv.lastMessageAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {statusBadge(conv.bookingStatus)}
              <Typography variant="caption" color="text.secondary" noWrap>
                {formatShortDateRange(conv.checkInDate, conv.checkOutDate)} · #
                {conv.bookingId}
              </Typography>
            </Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ flex: 1 }}
              >
                {conv.lastMessageContent}
              </Typography>
              {conv.unreadCount > 0 && (
                <Badge
                  badgeContent={conv.unreadCount}
                  color="primary"
                  sx={{ ml: 1, alignSelf: 'center' }}
                />
              )}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );

  const chatPanel = selectedBookingId !== null && (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
      }}
    >
      {/* Chat header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {!isDesktop && (
          <IconButton onClick={() => setSelectedBookingId(null)} size="small">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1">
            {selectedConversation?.otherPartyName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedConversation?.listingTitle}
          </Typography>
        </Box>
        {!isDesktop && (
          <Box sx={{ textAlign: 'right' }}>
            {selectedConversation && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                {statusBadge(selectedConversation.bookingStatus)}
              </Box>
            )}
            {selectedConversation && (
              <Typography variant="caption" color="text.secondary">
                {formatShortDateRange(
                  selectedConversation.checkInDate,
                  selectedConversation.checkOutDate,
                )}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Messages area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loadingMessages ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          messages.map((msg) => {
            const isSent = msg.senderId === userId;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isSent ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isSent ? 'primary.main' : 'grey.100',
                    color: isSent ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(msg.createdAt)}
                    {isSent && (msg.readAt ? ' \u2713\u2713' : ' \u2713')}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={4}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const emptyChat = !selectedBookingId && isDesktop && (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary">
        Select a conversation to start messaging
      </Typography>
    </Box>
  );

  const showList = isDesktop || selectedBookingId === null;
  const showChat = isDesktop || selectedBookingId !== null;

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        ml: (theme) => `-${theme.spacing(2)}`,
        mr: (theme) => `-${theme.spacing(2)}`,
      }}
    >
      {showList && conversationList}
      {showChat && (chatPanel || emptyChat)}
    </Box>
  );
}
