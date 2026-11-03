import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { sendMessage as apiSendMessage } from '../services/messageApi';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'traveler' | 'guide';
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  guideId: number | string;
  guideName: string;
  guideImage: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageStore {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  /** Traveler id derived from the signed-in user (falls back to a stable local id). */
  travelerId: string;
  /** Get or create a conversation with the given guide. */
  ensureConversation: (guide: { id: number | string; name: string; image: string }) => string;
  /** Send a message within a conversation (persists locally + attempts the API). */
  sendMessage: (conversationId: string, guideId: number | string, text: string) => Promise<void>;
  selectConversation: (id: string | null) => void;
  markRead: (conversationId: string) => void;
  messagesFor: (conversationId: string) => Message[];
}

const nowIso = () => new Date().toISOString();
const stableTravelerId = (): string => {
  let id = localStorage.getItem('gn_traveler_id');
  if (!id) {
    id = `trav_${Math.random().toString(36).slice(2)}`;
    try { localStorage.setItem('gn_traveler_id', id); } catch { /* storage unavailable – ignore */ }
  }
  return id;
};

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],
      activeConversationId: null,
      travelerId: stableTravelerId(),

      ensureConversation: (guide) => {
        const existing = get().conversations.find((c) => String(c.guideId) === String(guide.id));
        if (existing) {
          set({ activeConversationId: existing.id });
          return existing.id;
        }
        const id = `conv_${Math.random().toString(36).slice(2)}`;
        const conv: Conversation = {
          id,
          guideId: guide.id,
          guideName: guide.name,
          guideImage: guide.image,
          lastMessage: '',
          lastMessageAt: nowIso(),
          unreadCount: 0,
        };
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      sendMessage: async (conversationId, guideId, text) => {
        const { travelerId } = get();
        const user = useAuthStore.getState().user;
        const senderName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Traveler' : 'Traveler';
        const message: Message = {
          id: `msg_${Math.random().toString(36).slice(2)}`,
          conversationId,
          senderId: travelerId,
          senderName,
          senderRole: 'traveler',
          text,
          createdAt: nowIso(),
          read: false,
        };

        // Persist locally first so the UI stays responsive.
        set((state) => {
          const convIdx = state.conversations.findIndex((c) => c.id === conversationId);
          const nextConvs = [...state.conversations];
          if (convIdx !== -1) {
            nextConvs[convIdx] = {
              ...nextConvs[convIdx],
              lastMessage: text,
              lastMessageAt: message.createdAt,
              unreadCount: nextConvs[convIdx].unreadCount + 1,
            };
          }
          return {
            messages: [...state.messages, message],
            conversations: nextConvs.length ? nextConvs : state.conversations,
          };
        });

        // Attempt to persist on the server; degrade gracefully when the
        // messaging endpoint is unavailable so the flow remains functional.
        try {
          await apiSendMessage({ conversation_id: conversationId, guide_id: Number(guideId) || null, text });
        } catch {
          // Offline / endpoint missing: keep the locally stored message.
        }
      },

      selectConversation: (id) => set({ activeConversationId: id }),

      markRead: (conversationId) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.conversationId === conversationId && m.senderRole === 'guide' ? { ...m, read: true } : m
          ),
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      messagesFor: (conversationId) =>
        get()
          .messages.filter((m) => m.conversationId === conversationId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }),
    { name: 'message-storage' }
  )
);
