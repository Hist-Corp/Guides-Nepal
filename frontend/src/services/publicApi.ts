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
    const queue = JSON.parse(raw) as {
      kind: string;
      path?: string;
      payload: Record<string, unknown>;
    }[];
    const remaining: typeof queue = [];
    for (const item of queue) {
      // Older versions queued guide passwords in plaintext. Never retry or
      // retain those credential-bearing submissions from localStorage.
      if (item.kind === 'guide-application') continue;
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
  if (kind === 'guide-application') return '/guide-applications';
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

export function submitGuideApplication(payload: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  region?: string;
  nin_number?: string;
  files: {
    citizenshipFront: File;
    citizenshipBack: File;
    liveSelfie: File;
    holdingCitizenship: File;
    certificate: File;
  };
}) {
  // Unlike other public forms, guide applications carry a password. Do not
  // use the generic offline queue, which stores its payload in localStorage.
  const formData = new FormData();
  formData.append('full_name', payload.full_name);
  formData.append('email', payload.email);
  formData.append('password', payload.password);
  if (payload.phone) formData.append('phone', payload.phone);
  if (payload.city) formData.append('city', payload.city);
  if (payload.region) formData.append('region', payload.region);
  if (payload.nin_number) formData.append('nin_number', payload.nin_number);
  Object.entries(payload.files).forEach(([key, file]) => formData.append(key, file));
  return axios
    .post(`${API_BASE_URL}/guide-applications`, formData, { timeout: 30000 })
    .then(() => ({ ok: true as const, synced: true }))
    .catch((error: unknown) => {
      if (axios.isAxiosError(error)) {
        const detail: unknown = error.response?.data?.detail;
        if (typeof detail === 'string') throw new Error(detail);
      }
      throw error;
    });
}

// ---------------- Authenticated: regional-head guide application review ----------------

export interface GuideApplicationItem {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  region: string | null;
  nin_number: string | null;
  documents: string | null;
  status: string;
  created_at: string | null;
}

export async function fetchGuideApplications(
  token: string,
  region?: string,
  statusFilter?: string,
): Promise<GuideApplicationItem[]> {
  const params = new URLSearchParams();
  if (region) params.set('region', region);
  if (statusFilter) params.set('status_filter', statusFilter);
  const r = await fetch(`${API_BASE_URL}/operations/guide-applications?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error('Unable to load guide applications.');
  return r.json();
}

export async function reviewGuideApplication(
  token: string,
  applicationId: number,
  status: 'approved' | 'rejected' | 'pending',
  reviewNote?: string,
) {
  const r = await fetch(`${API_BASE_URL}/operations/guide-applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, review_note: reviewNote }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: 'Unable to review application.' }));
    throw new Error(err.detail || 'Unable to review application.');
  }
  return r.json();
}
