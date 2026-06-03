"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [contextLabel, setContextLabel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return conversations.filter((conv) => {
      if (!query) return true;
      const peer = conv.participants.find((p) => p._id !== user?.id) || conv.participants[0];
      const nameOrEmail = `${peer?.name || ''} ${peer?.email || ''}`.toLowerCase();
      const propertyName = conv.property?.propertyName?.toLowerCase() || '';
      const lastMessage = conv.lastMessage?.toLowerCase() || '';
      return nameOrEmail.includes(query) || propertyName.includes(query) || lastMessage.includes(query);
    });
  }, [conversations, searchQuery, user?.id]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedId) || null,
    [conversations, selectedId]
  );

  const otherParticipant = (conversation: Conversation | null) => {
    if (!conversation) return null;
    return conversation.participants.find((p) => p._id !== user?.id) || conversation.participants[0] || null;
  };

  useEffect(() => {
    if (!messageLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, messageLoading]);

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
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} sx={{ mb: 2, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Secure Messaging</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
            Stay connected with your conversations through a modern, focused chat experience.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={`${conversations.length} conversations`} color="primary" variant="outlined" />
          <Chip label={`${conversations.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0)} unread`} color="secondary" variant="outlined" />
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', minHeight: { xs: 680, md: 720 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, boxShadow: 6 }}>
        <Box sx={{ borderRight: { md: '1px solid' }, borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Conversations</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>Search messages, people, or properties.</Typography>
            <TextField
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pr: 0.75, color: 'text.secondary' }}>
                    <SearchRoundedIcon fontSize="small" />
                  </Box>
                ),
              }}
              sx={{ mt: 2, backgroundColor: 'background.paper', borderRadius: 2 }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>No conversations found</Typography>
                <Typography variant="body2" color="text.secondary">Try adjusting your search or start a new conversation.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.25} sx={{ p: 2 }}>
                {filteredConversations.map((conv) => {
                  const peer = otherParticipant(conv);
                  const selected = conv._id === selectedId;
                  return (
                    <Box
                      key={conv._id}
                      onClick={() => setSelectedId(conv._id)}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: selected ? 'primary.main' : 'background.paper',
                        color: selected ? 'common.white' : 'text.primary',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                        boxShadow: selected ? '0 12px 24px rgba(25, 118, 210, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.05)',
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)' },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={peer?.avatar || undefined} sx={{ width: 44, height: 44, bgcolor: selected ? 'rgba(255,255,255,0.18)' : 'primary.main' }}>
                          {(peer?.name || peer?.email || '?')[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
                              {peer?.name || peer?.email || 'User'}
                            </Typography>
                            {conv.unreadCount ? (
                              <Chip size="small" label={`${conv.unreadCount} new`} color={selected ? 'secondary' : 'info'} sx={{ fontWeight: 700 }} />
                            ) : null}
                          </Stack>
                          <Typography variant="caption" noWrap color={selected ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>
                            {conv.property?.propertyName ? `${conv.property.propertyName} · ` : ''}{conv.lastMessage || 'No messages yet'}
                          </Typography>
                          <Typography variant="caption" color={selected ? 'rgba(255,255,255,0.72)' : 'text.secondary'} sx={{ display: 'block', mt: 0.5 }}>
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString('en-ZA', { month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' }) : 'Updated recently'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {selectedConversation ? (
            <>
              <Box sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={otherParticipant(selectedConversation)?.avatar || undefined} sx={{ width: 52, height: 52 }}>
                    {(otherParticipant(selectedConversation)?.name || otherParticipant(selectedConversation)?.email || 'U')[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {otherParticipant(selectedConversation)?.name || 'Conversation'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mt: 0.75 }}>
                      <Chip label={selectedConversation.property?.propertyName ? selectedConversation.property.propertyName : 'Direct message'} size="small" color="secondary" />
                      {contextLabel ? <Chip label={contextLabel} size="small" /> : null}
                    </Stack>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {selectedConversation.lastMessageAt ? new Date(selectedConversation.lastMessageAt).toLocaleString('en-ZA', { hour:'2-digit', minute:'2-digit' }) : ''}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, bgcolor: 'rgba(15,23,42,0.03)' }}>
                {messageLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={24} /></Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No messages yet</Typography>
                    <Typography color="text.secondary">Send a note to get the conversation started.</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {messages.map((m) => {
                      const mine = m.sender?._id === user?.id;
                      return (
                        <Box key={m._id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                          <Box sx={{
                            maxWidth: '80%',
                            px: 2,
                            py: 1.5,
                            bgcolor: mine ? 'primary.main' : 'common.white',
                            color: mine ? 'common.white' : 'text.primary',
                            borderRadius: 3,
                            borderTopLeftRadius: mine ? 3 : 0,
                            borderTopRightRadius: mine ? 0 : 3,
                            boxShadow: '0 2px 12px rgba(15,23,42,0.08)',
                          }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                            <Typography variant="caption" sx={{ mt: 0.75, display: 'block', opacity: 0.72, color: mine ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                              {new Date(m.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: { xs: 2, md: 3 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: { xs: 2, md: 1 }, flexWrap: 'wrap' }}>
                  {quickTemplates.map((template) => (
                    <Chip
                      key={template}
                      size="small"
                      label={template.length > 26 ? `${template.slice(0, 26)}...` : template}
                      onClick={() => setDraft(template)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="medium"
                    fullWidth
                    placeholder="Type your message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    multiline
                    minRows={2}
                    maxRows={4}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={sendMessage}
                    disabled={!draft.trim() || sending}
                    sx={{ whiteSpace: 'nowrap', px: 3 }}
                  >
                    Send
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Select a conversation</Typography>
              <Typography color="text.secondary">Choose an existing thread or browse properties to open a new one.</Typography>
              <Button variant="contained" sx={{ mt: 3 }} onClick={() => router.push(propertiesPath)}>
                Browse Properties
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
