import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MessageCircle, Search, Clock } from 'lucide-react';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { allGuides } from '../../data/guidesData';

const TravellerMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const conversations = useMessageStore((s) => s.conversations);
  const activeConversationId = useMessageStore((s) => s.activeConversationId);
  const selectConversation = useMessageStore((s) => s.selectConversation);

  // Resolve the guide record behind each stored conversation so we can show
  // the guide's real name / avatar (the store keeps a denormalised copy, but
  // falling back to the catalog keeps the UI consistent if it drifts).
  const items = useMemo(
    () =>
      conversations
        .map((conv) => {
          const guide = allGuides.find((g) => String(g.id) === String(conv.guideId));
          return {
            conv,
            guide: guide ?? { id: conv.guideId, name: conv.guideName, image: conv.guideImage },
          };
        })
        .sort((a, b) => {
          const ta = a.conv.lastMessageAt ? new Date(a.conv.lastMessageAt).getTime() : 0;
          const tb = b.conv.lastMessageAt ? new Date(b.conv.lastMessageAt).getTime() : 0;
          return tb - ta;
        }),
    [conversations]
  );

  const openConversation = (conv: (typeof items)[number]) => {
    selectConversation(conv.conv.id);
    navigate(`/messages/guide/${conv.guide.id}`);
  };

  const travelerName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Traveller' : 'Traveller';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">
            Your conversations with local guides. Messages are linked to your bookings and stay on the platform.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-[#213448] mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No conversations yet</h2>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              {travelerName}, you haven't messaged any guides yet. Book an experience or say hello to a guide to start a conversation.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a] transition-colors"
              >
                <Search className="h-4 w-4" /> Explore experiences
              </Link>
              <Link
                to="/bookings"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                My bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ conv, guide }) => {
              const isActive = conv.id === activeConversationId;
              const unread = conv.unreadCount > 0;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => openConversation({ conv, guide })}
                  className={`w-full text-left flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                    isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200">
                    <img src={guide.image} alt={guide.name} className="h-full w-full object-cover" />
                    {unread && <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-base font-bold text-gray-900">{guide.name}</p>
                      {conv.lastMessageAt && (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500">
                      {conv.lastMessage ? conv.lastMessage : 'No messages yet'}
                    </p>
                  </div>
                  <MessageCircle className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-gray-300'}`} />
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center text-xs text-gray-400">
          <p>Messages are delivered to your selected guide. Keep personal and payment details on the platform.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TravellerMessagesPage;