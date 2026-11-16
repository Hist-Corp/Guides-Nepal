import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../utils/backNavigation';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Send, ArrowLeft, MoreHorizontal, MessageCircle, Check, Clock } from 'lucide-react';
import { allGuides } from '../../data/guidesData';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: 'traveler' | 'guide';
  createdAt: string;
  status: MessageStatus;
}

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const isSameDay = (a: string, b: string) => {
  return new Date(a).toDateString() === new Date(b).toDateString();
};

const GuideChatPage: React.FC = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { user } = useAuthStore();

  const guide = allGuides.find((g) => String(g.id) === guideId) ?? allGuides[0];
  const isLoggedIn = !!user;
  const travelerId = useMessageStore((s) => s.travelerId);
  const currentUserRole = user?.role ?? 'traveler';

  const conversations = useMessageStore((s) => s.conversations);
  const messages = useMessageStore((s) => s.messages);
  const activeConversationId = useMessageStore((s) => s.activeConversationId);
  const sendMessageStore = useMessageStore((s) => s.sendMessage);
  const markRead = useMessageStore((s) => s.markRead);
  const ensureConversationStore = useMessageStore((s) => s.ensureConversation);

  // Find/create the conversation with this guide.
  const conversation = useMemo(() => {
    return conversations.find((c) => String(c.guideId) === String(guideId));
  }, [conversations, guideId]);

  const conversationId = conversation?.id ?? activeConversationId ?? null;

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [localPending, setLocalPending] = useState<Record<string, MessageStatus>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sortedMessages = useMemo(() => {
    if (!conversationId) return [];
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((m): ChatMessage => ({
        id: m.id,
        text: m.text,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        createdAt: m.createdAt,
        status: m.read ? 'read' : (m.senderId === travelerId ? 'sent' : 'delivered'),
      }));
  }, [messages, conversationId, travelerId]);

  // Derive a readable label for the person we are chatting with.
  const counterpartName = useMemo(() => {
    if (currentUserRole === 'guide') return 'Traveller';
    return guide?.name ?? 'Guide';
  }, [currentUserRole, guide]);

  // Determine sender side for bubble alignment.
  const isSender = (m: ChatMessage) => m.senderId === travelerId;

  useEffect(() => {
    if (!guide) return;
    ensureConversationStore({ id: guide.id, name: guide.name, image: guide.image });
  }, [guide, ensureConversationStore]);

  useEffect(() => {
    if (conversationId && activeConversationId === conversationId) {
      markRead(conversationId);
    }
  }, [conversationId, activeConversationId, markRead]);

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    const end = messagesEndRef.current;
    const container = scrollContainerRef.current;
    if (end) {
      end.scrollIntoView({ behavior: 'smooth' });
    } else if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [sortedMessages, conversationId]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversationId || !guide) return;

    const tempId = `msg_temp_${Date.now()}`;
    setLocalPending((prev) => ({ ...prev, [tempId]: 'sending' }));
    setSending(true);
    setInput('');

    const optimistic: ChatMessage = {
      id: tempId,
      text,
      senderId: travelerId,
      senderName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'You' : 'You',
      senderRole: 'traveler',
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    try {
      await sendMessageStore(conversationId, guide.id, text);
      setLocalPending((prev) => {
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
    } catch {
      setLocalPending((prev) => ({ ...prev, [tempId]: 'sent' }));
    } finally {
      setSending(false);
    }
  }, [input, conversationId, guide.id, sendMessageStore, travelerId, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const statusIcon = (status: MessageStatus) => {
    if (status === 'sending') return <Clock className="w-3 h-3 text-gray-400" />;
    return <Check className={`w-3 h-3 ${status === 'sent' ? 'text-gray-400' : 'text-primary'}`} />;
  };

  if (!guide) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Desktop wrapper: centered max-width */}
      <main id="main-content" className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
        <div className="relative z-10 w-full">
          {/* Chat header */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => goBack()}>
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors"
                onClick={() => {
                  if (currentUserRole === 'guide') {
                    navigate('/profile');
                  } else {
                    navigate(`/guides/${guideId}`);
                  }
                }}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-sm leading-tight">{counterpartName}</h1>
                  <p className="text-xs text-green-600 font-medium leading-tight">
                    {currentUserRole === 'guide' ? 'View traveller profile' : 'View guide profile'} <span className="ml-1">· online</span>
                  </p>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </header>

          {/* Chat area */}
          <div
            ref={scrollContainerRef}
            className="flex-grow overflow-y-auto p-6 space-y-4"
          >
            {sortedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <MessageCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No conversation yet</h3>
                <p className="text-gray-500 max-w-xs">
                  Start a conversation with {counterpartName}. Keep personal and payment details on the platform.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> Start messaging
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {sortedMessages.map((m, idx) => {
                  const prev = sortedMessages[idx - 1];
                  const showDate = !prev || !isSameDay(prev.createdAt, m.createdAt);
                  const showAvatar = !prev || prev.senderId !== m.senderId;
                  const sender = isSender(m) ? 'right' : 'left';
                  const status = localPending[m.id] ?? m.status;

                  return (
                    <div key={m.id} className="flex w-full animate-message">
                      {showDate && (
                        <div className="flex w-full items-center mb-2">
                          <span className="px-3 py-1 text-[11px] font-medium text-gray-400 bg-white rounded-full shadow-sm border border-gray-100">
                            {formatDate(m.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex w-full gap-3 ${sender === 'right' ? 'justify-end' : 'justify-start'}`}
                      >
                        {sender === 'left' && showAvatar && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                              <img src={guide.image} alt={guide.name} className="h-full w-full object-cover" />
                            </div>
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[80%] break-words ${
                            sender === 'right'
                              ? 'bg-primary text-white rounded-tr-none self-end'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none self-start'
                          }`}
                        >
                          {m.text}
                          <div className="flex items-center justify-end gap-1 mt-1.5">
                            <span className="text-[10px] text-right">
                              {sender === 'right' ? formatTime(m.createdAt) : formatTime(m.createdAt)}
                            </span>
                            {sender === 'right' && (
                              <>
                                {statusIcon(status)}
                                <span className="text-[9px] text-gray-400">{status}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {sender === 'right' && showAvatar && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                              {user
                                ? `${user.firstName ?? ''}${user.lastName ?? ''}`.charAt(0).toUpperCase()
                                : 'U'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 z-30 w-full bg-white border-t border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto w-full">
            <form onSubmit={handleSend} className="relative flex items-end gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${counterpartName}…`}
                disabled={!isLoggedIn}
                className="flex-grow bg-gray-50 text-gray-900 placeholder-gray-400 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                autoFocus
              />
              {isLoggedIn ? (
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white p-3 rounded-full transition-colors shadow-sm flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : null}
            </form>
            {!isLoggedIn && (
              <p className="text-center mt-2 text-[11px] text-gray-500">
                Please log in to send messages.
              </p>
            )}
            <p className="text-center mt-2 text-[10px] text-gray-400">
              Messages are delivered to {counterpartName}. Keep personal and payment details on the platform.
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default GuideChatPage;
