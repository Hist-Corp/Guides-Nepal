import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGoBack } from '../../utils/backNavigation';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Send, ArrowLeft, MoreHorizontal, MessageCircle } from 'lucide-react';
import { allGuides } from '../../data/guidesData';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';

const GuideChatPage: React.FC = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const goBack = useGoBack();
  const guide = allGuides.find((g) => String(g.id) === guideId) ?? allGuides[0];
  const travelerId = useMessageStore((s) => s.travelerId);
  const conversationId = useMessageStore((s) => s.activeConversationId);
  const { user } = useAuthStore();
  const senderName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'You' : 'You';

  const sendMessage = useMessageStore((s) => s.sendMessage);
  const markRead = useMessageStore((s) => s.markRead);
  const activeConversationId = useMessageStore((s) => s.activeConversationId);
  const ensureConversationStore = useMessageStore((s) => s.ensureConversation);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const allMessages = useMessageStore((s) => s.messages);
  const messages = useMemo(() => {
    if (!conversationId) return [];
    return allMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [allMessages, conversationId]);

  useEffect(() => {
    if (!guide) return;
    ensureConversationStore({ id: guide.id, name: guide.name, image: guide.image });
  }, [guide, ensureConversationStore]);

  useEffect(() => {
    if (conversationId && activeConversationId === conversationId) {
      markRead(conversationId);
    }
  }, [conversationId, activeConversationId, markRead]);

  useEffect(() => {
    const end = messagesEndRef.current;
    if (end) end.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendMessage(conversationId, guide.id, text);
      setInput('');
    } finally {
      setSending(false);
    }
  }, [input, conversationId, guide.id, sendMessage]);

  if (!guide) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main id="main-content" className="flex-grow flex flex-col max-w-2xl mx-auto w-full p-4 pb-24">
        {/* Chat header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              onClick={() => goBack()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden border border-gray-200">
                <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm leading-tight">{guide.name}</h1>
                <p className="text-xs text-green-500 font-medium leading-tight">Message guide</p>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </header>

        {/* Chat area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-[#213448] mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No conversation yet</h3>
              <p className="text-gray-500 max-w-xs">
                Start a conversation with {guide.name} about your booking.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex w-full ${m.senderId === travelerId ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex max-w-[80%] md:max-w-[70%] gap-3 ${m.senderId === travelerId ? 'flex-row-reverse' : 'flex-row'}">
                  {m.senderId !== travelerId && (
                    <div className="flex-shrink-0 mt-auto">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                        <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                      m.senderId === travelerId
                        ? 'bg-[#213448] text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                    <span className="block text-[10px] text-gray-400 mt-1 text-right">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {m.senderId === travelerId && (
                    <div className="flex-shrink-0 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                        {senderName[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${guide.name}…`}
              className="flex-grow bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white p-3.5 rounded-full transition-colors shadow-sm flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              Messages are delivered to {guide.name}. Keep personal and payment details on the platform.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuideChatPage;
