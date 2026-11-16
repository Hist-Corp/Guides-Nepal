import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface MessagePayload {
  conversation_id: string;
  guide_id: number | null;
  text: string;
}

export interface MessageOut {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'traveler' | 'guide';
  text: string;
  created_at: string;
  read: boolean;
}

export interface ConversationOut {
  id: string;
  guide_id: number | string;
  guide_name: string;
  guide_image: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

function headers(token?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/**
 * Send a direct message to a guide within a conversation.
 * Degrades gracefully: if the backend messaging endpoint is unavailable the
 * call resolves without throwing so the client-side store remains authoritative.
 */
export async function sendMessage(payload: MessagePayload, token?: string): Promise<{ ok: boolean; synced: boolean }> {
  try {
    await axios.post(
      `${API_BASE_URL}/messages/conversations/${payload.conversation_id}/messages`,
      { body: payload.text },
      { timeout: 8000, headers: headers(token) },
    );
    return { ok: true, synced: true };
  } catch {
    return { ok: true, synced: false };
  }
}

/** List conversations for the signed-in user. */
export async function listConversations(token?: string): Promise<ConversationOut[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/conversations`, {
      timeout: 8000,
      headers: headers(token),
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    return rows.map((row: any) => ({
      id: String(row.id),
      guide_id: row.guide_id,
      guide_name: row.counterpart?.name ?? row.guide_name ?? 'Guide',
      guide_image: row.counterpart?.avatar_url ?? row.guide_image ?? '',
      last_message: row.last_message ?? '',
      last_message_at: row.last_message_at ?? row.created_at ?? '',
      unread_count: row.unread_count ?? 0,
    }));
  } catch {
    return [];
  }
}

/** List messages for a conversation. */
export async function listMessages(conversationId: string, token?: string): Promise<MessageOut[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
      timeout: 8000,
      headers: headers(token),
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    return rows.map((row: any) => ({
      id: String(row.id),
      conversation_id: String(row.conversation_id),
      sender_id: String(row.sender_id),
      sender_name: row.sender_name,
      sender_role: row.sender_role,
      text: row.body,
      created_at: row.created_at,
      read: row.status === 'read',
    }));
  } catch {
    return [];
  }
}

/** Mark all unread messages in a conversation as read. */
export async function markRead(conversationId: string, token?: string): Promise<boolean> {
  try {
    await axios.post(
      `${API_BASE_URL}/messages/conversations/${conversationId}/read`,
      { conversation_id: conversationId },
      { timeout: 8000, headers: headers(token) },
    );
    return true;
  } catch {
    return false;
  }
}

/** Get-or-create a conversation with the given counterpart user id. */
export async function ensureConversation(
  counterpartId: number,
  token?: string,
  bookingId?: number,
): Promise<string | null> {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/messages/conversations`,
      { guide_id: counterpartId, booking_id: bookingId ?? null },
      { timeout: 8000, headers: headers(token) },
    );
    return String(res.data?.id ?? null);
  } catch {
    return null;
  }
}

/** Unread message count for the signed-in user. */
export async function unreadCount(token?: string): Promise<number> {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/conversations/unread-count`, {
      timeout: 8000,
      headers: headers(token),
    });
    return typeof res.data?.unread_count === 'number' ? res.data.unread_count : 0;
  } catch {
    return 0;
  }
}
