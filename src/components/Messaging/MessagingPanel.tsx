"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

interface Participant {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  property?: { _id: string; propertyName?: string; city?: string } | null;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  text: string;
  sender: Participant;
  createdAt: string;
}

type Props = {
  propertiesPath?: string; // where "browse properties" should route to
};

export default function MessagingPanel({ propertiesPath = '/browse' }: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [contextLabel, setContextLabel] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/');
  }, [isLoading, isAuthenticated, router]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages');
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setConversations(data);
      if (!selectedId && data[0]?._id) setSelectedId(data[0]._id);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setMessageLoading(true);
      const res = await api.get(`/messages/${conversationId}`);
      const payload = res.data?.data;
      setMessages(Array.isArray(payload?.messages) ? payload.messages : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load messages');
    } finally {
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll conversations periodically to get new messages and unread counts
  useEffect(() => {
    const id = setInterval(() => {
      loadConversations();
    }, 10_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
    // Poll the selected conversation for new messages
    let pollId: NodeJS.Timeout | null = null;
    if (selectedId) {
      pollId = setInterval(() => {
        loadMessages(selectedId);
      }, 4000);
    }
    return () => { if (pollId) clearInterval(pollId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = new URLSearchParams(window.location.search);
    const conversationId = qs.get('conversationId');
    if (conversationId) setSelectedId(conversationId);
    const context = qs.get('context');
    if (context === 'allocation') setContextLabel('Room allocation update thread');
    if (context === 'move-in') setContextLabel('Move-in coordination thread');
    if (context === 'application') setContextLabel('Application update thread');
  }, []);

  // Socket.IO real-time client
  useEffect(() => {
    let socket: any = null;
    let joinedConv: string | null = null;
    const setup = async () => {
      if (typeof window === 'undefined' || !user?.id) return;
      try {
        // dynamic import to avoid SSR issues
        // @ts-expect-error: socket.io-client may not have types installed in this workspace
        const { io } = await import('socket.io-client');
        const base = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')) || 'http://localhost:5000';
        socket = io(base, { path: '/socket.io', transports: ['websocket'], auth: { token: localStorage.getItem('token') } });

        socket.on('connect', () => {
          socket.emit('join', { userId: user.id });
          if (selectedId) {
            socket.emit('joinConversation', { conversationId: selectedId });
            joinedConv = selectedId;
          }
        });

        socket.on('message', (payload: any) => {
          const incoming = payload?.message || payload;
          const cid = payload?.conversationId || incoming?.conversation || incoming?.conversation?._id;
          const strCid = cid ? String(cid) : null;
          if (strCid && strCid === selectedId) {
            setMessages((prev) => [...prev, incoming]);
          } else {
            // update conversations list to reflect unread counts / last message
            loadConversations();
          }
        });

        socket.on('conversation:update', (conv: any) => {
          setConversations((prev) => {
            const found = prev.find((p) => String(p._id) === String(conv._id));
            if (found) {
              return prev.map((p) => (String(p._id) === String(conv._id) ? conv : p));
            }
            return [conv, ...prev];
          });
        });

        socket.on('conversation:new', (conv: any) => {
          setConversations((prev) => {
            if (prev.find((p) => String(p._id) === String(conv._id))) return prev;
            return [conv, ...prev];
          });
        });
      } catch (err) {
        // ignore socket errors, polling will continue
      }
    };
    setup();

    return () => {
      try {
        if (socket) {
          if (joinedConv) socket.emit('leaveConversation', { conversationId: joinedConv });
          socket.disconnect();
        }
      } catch (err) { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedId]);

  const quickTemplates = [
    'Hi, can you confirm the next step for my application?',
    'Could you share move-in checklist details?',
    'Can you confirm room allocation and key handover timing?',
    'Please share lease copy and payment instructions.',
  ];

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedId) || null,
    [conversations, selectedId]
  );

  const otherParticipant = (conversation: Conversation | null) => {
    if (!conversation) return null;
    return conversation.participants.find((p) => p._id !== user?.id) || conversation.participants[0] || null;
  };

  const sendMessage = async () => {
    if (!selectedId || !draft.trim()) return;
    try {
      setSending(true);
      const res = await api.post(`/messages/${selectedId}`, { text: draft.trim() });
      const sent = res.data?.data;
      if (sent) setMessages((prev) => [...prev, sent]);
      setConversations((prev) => prev.map((conv) => (
        conv._id === selectedId
          ? { ...conv, lastMessage: draft.trim(), lastMessageAt: new Date().toISOString(), unreadCount: 0 }
          : conv
      )));
      setDraft('');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Secure Messaging</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', minHeight: { xs: 560, md: 620 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' } }}>
        <Box sx={{ borderRight: { md: '1px solid' }, borderColor: 'divider', maxHeight: { xs: 220, md: 'unset' }, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 600 }}>No conversations yet</Typography>
              <Typography variant="body2" color="text.secondary">Open a conversation to start chatting.</Typography>
            </Box>
          ) : (
            <Stack>
              {conversations.map((conv) => {
                const peer = otherParticipant(conv);
                const selected = conv._id === selectedId;
                return (
                  <Box
                    key={conv._id}
                    onClick={() => setSelectedId(conv._id)}
                    sx={{ p: 1.25, cursor: 'pointer', bgcolor: selected ? 'action.selected' : 'transparent', borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                      <Avatar src={peer?.avatar || undefined} sx={{ width: 36, height: 36 }}>
                        {(peer?.name || peer?.email || '?')[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{peer?.name || peer?.email || 'User'}</Typography>
                          {conv.unreadCount ? <Typography variant="caption" color="primary">{conv.unreadCount}</Typography> : null}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {conv.property?.propertyName ? `${conv.property.propertyName} · ` : ''}{conv.lastMessage || 'No messages yet'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {selectedConversation ? (
            <>
              <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontWeight: 700 }}>{otherParticipant(selectedConversation)?.name || 'Conversation'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedConversation.property?.propertyName ? `Property: ${selectedConversation.property.propertyName}` : 'Direct message'}
                </Typography>
                {contextLabel ? (
                  <Alert severity="info" sx={{ mt: 1, py: 0 }}>{contextLabel}</Alert>
                ) : null}
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, bgcolor: '#f8fafc' }}>
                {messageLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={24} /></Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">No messages yet. Start the conversation below.</Typography>
                  </Box>
                ) : (
                  <Stack sx={{ gap: 1 }}>
                    {messages.map((m) => {
                      const mine = m.sender?._id === user?.id;
                      return (
                        <Box key={m._id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                          <Paper sx={{ maxWidth: '80%', px: 1.25, py: 1, bgcolor: mine ? 'primary.main' : 'white', color: mine ? 'white' : 'text.primary', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.25 }}>
                              {new Date(m.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Paper>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Stack direction="row" sx={{ gap: 1, p: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'center', mr: 1, display: { xs: 'none', md: 'flex' } }}>
                  {quickTemplates.map((template) => (
                    <Chip
                      key={template}
                      size="small"
                      label={template.length > 28 ? `${template.slice(0, 28)}...` : template}
                      onClick={() => setDraft(template)}
                    />
                  ))}
                </Stack>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Type your message"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <IconButton color="primary" onClick={sendMessage} disabled={!draft.trim() || sending}>
                  <SendRoundedIcon />
                </IconButton>
              </Stack>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Select a conversation to start messaging.</Typography>
              <Button sx={{ mt: 2, textTransform: 'none' }} onClick={() => router.push(propertiesPath)}>Browse Properties</Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
