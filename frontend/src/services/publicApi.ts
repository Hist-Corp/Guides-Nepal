import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Public (no-auth) form submissions: contact page, guide personalization
 * requests and guide/host registration. Every call degrades gracefully:
 * if the backend is unreachable the submission is queued in localStorage
 * so the user flow always completes.
 */

const QUEUE_KEY = 'gn-pending-submissions';

function queueOffline(kind: string, payload: unknown) {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({ kind, payload, at: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
  } catch {
    /* storage unavailable – ignore */
  }
}

async function submit(kind: string, path: string, payload: Record<string, unknown>) {
  try {
    await axios.post(`${API_BASE_URL}${path}`, payload, { timeout: 8000 });
    return { ok: true as const, synced: true };
  } catch {
    queueOffline(kind, payload);
    return { ok: true as const, synced: false };
  }
}

// Flush anything queued while offline. Called on app load.
export async function flushPendingSubmissions() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue: { kind: string; path?: string; payload: any }[] = JSON.parse(raw);
    const remaining: typeof queue = [];
    for (const item of queue) {
      try {
        await axios.post(`${API_BASE_URL}${item.path ?? pathFor(item.kind)}`, item.payload, { timeout: 8000 });
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    /* ignore */
  }
}

function pathFor(kind: string) {
  if (kind === 'host-application') return '/host-applications';
  if (kind === 'support-ticket') return '/operations/support-tickets';
  return '/inquiries';
}

export function sendContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return submit('contact', '/inquiries', { ...payload, category: 'contact' });
}

export function sendGuideRequest(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return submit('guide-request', '/inquiries', { ...payload, category: 'guide-request' });
}

export function submitSupportTicket(payload: {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: string;
}) {
  return submit('support-ticket', '/operations/support-tickets', payload);
}

export function submitHostApplication(payload: {
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  documents?: string;
}) {
  return submit('host-application', '/host-applications', payload);
}
