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

/**
 * Send a direct message to a guide within a conversation.
 * Degrades gracefully: if the backend messaging endpoint is unavailable the
 * call resolves without throwing so the client-side store remains authoritative.
 */
export async function sendMessage(payload: MessagePayload): Promise<{ ok: boolean; synced: boolean }> {
  try {
    await axios.post(`${API_BASE_URL}/messages/`, payload, { timeout: 8000 });
    return { ok: true, synced: true };
  } catch {
    return { ok: true, synced: false };
  }
}

/** List conversations for the signed-in traveler. */
export async function listConversations(token?: string): Promise<ConversationOut[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/`, {
      timeout: 8000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** List messages for a conversation. */
export async function listMessages(conversationId: string, token?: string): Promise<MessageOut[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/${conversationId}`, {
      timeout: 8000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}
