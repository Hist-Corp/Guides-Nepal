import { API_BASE_URL } from '../config/api';

/**
 * Client for the experience workflow API (SOP-GN-EXP-001 / SOP-GN-EXP-002).
 *
 * - Proposals: new-experience submissions approved by a Regional Manager OR Content Writer.
 * - Change requests: modifications to an existing listing approved by a Regional Manager only.
 */

export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'published'
  | 'cancelled';

export type ChangeRequestStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'applied'
  | 'cancelled';

export type WorkflowCategory = 'trekking' | 'tour' | 'specialized';

export interface DocumentLink {
  name: string;
  url: string;
}

export interface ExperienceProposal {
  id: number;
  guide_user_id: number;
  guide_name?: string | null;
  guide_email?: string | null;
  title: string;
  category: WorkflowCategory;
  city: string;
  area?: string | null;
  description: string;
  itinerary?: string | null;
  meeting_point?: string | null;
  duration: string;
  difficulty: string;
  price: number;
  max_guests: number;
  documents: DocumentLink[];
  status: ProposalStatus;
  submitted_at?: string | null;
  decided_at?: string | null;
  decided_by_user_id?: number | null;
  decided_by_role?: string | null;
  decision_notes?: string | null;
  published_at?: string | null;
  listing_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FieldChange {
  field: string;
  current?: unknown;
  proposed: unknown;
}

export interface ExperienceChangeRequest {
  id: number;
  guide_user_id: number;
  guide_name?: string | null;
  guide_email?: string | null;
  listing_id: number;
  listing_title?: string | null;
  listing_active?: boolean | null;
  change_class: 'material' | 'minor';
  reason: string;
  changes: FieldChange[];
  documents: DocumentLink[];
  status: ChangeRequestStatus;
  submitted_at?: string | null;
  decided_at?: string | null;
  decided_by_user_id?: number | null;
  decided_by_role?: string | null;
  decision_notes?: string | null;
  applied_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function handle<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || fallback);
  return res.json() as Promise<T>;
}

export const experienceWorkflowApi = {
  // ---- Proposals (SOP-GN-EXP-001) ----
  listProposals: async (token: string): Promise<ExperienceProposal[]> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals`, { headers: authHeaders(token) });
    return handle<ExperienceProposal[]>(res, 'Unable to load proposals.');
  },
  getProposal: async (token: string, id: number): Promise<ExperienceProposal> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals/${id}`, { headers: authHeaders(token) });
    return handle<ExperienceProposal>(res, 'Unable to load proposal.');
  },
  createProposal: async (token: string, payload: Record<string, unknown>): Promise<ExperienceProposal> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handle<ExperienceProposal>(res, 'Unable to create proposal.');
  },
  updateProposal: async (token: string, id: number, payload: Record<string, unknown>): Promise<ExperienceProposal> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handle<ExperienceProposal>(res, 'Unable to update proposal.');
  },
  submitProposal: async (token: string, id: number): Promise<ExperienceProposal> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals/${id}/submit`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handle<ExperienceProposal>(res, 'Unable to submit proposal.');
  },
  withdrawProposal: async (token: string, id: number): Promise<ExperienceProposal> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals/${id}/withdraw`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handle<ExperienceProposal>(res, 'Unable to withdraw proposal.');
  },
  publishProposal: async (token: string, id: number): Promise<ExperienceProposal> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/proposals/${id}/publish`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handle<ExperienceProposal>(res, 'Unable to publish proposal.');
  },

  // ---- Change requests (SOP-GN-EXP-002) ----
  listChangeRequests: async (token: string): Promise<ExperienceChangeRequest[]> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/change-requests`, { headers: authHeaders(token) });
    return handle<ExperienceChangeRequest[]>(res, 'Unable to load change requests.');
  },
  getChangeRequest: async (token: string, id: number): Promise<ExperienceChangeRequest> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/change-requests/${id}`, { headers: authHeaders(token) });
    return handle<ExperienceChangeRequest>(res, 'Unable to load change request.');
  },
  createChangeRequest: async (token: string, payload: Record<string, unknown>): Promise<ExperienceChangeRequest> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/change-requests`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handle<ExperienceChangeRequest>(res, 'Unable to create change request.');
  },
  submitChangeRequest: async (token: string, id: number): Promise<ExperienceChangeRequest> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/change-requests/${id}/submit`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handle<ExperienceChangeRequest>(res, 'Unable to submit change request.');
  },
  withdrawChangeRequest: async (token: string, id: number): Promise<ExperienceChangeRequest> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/change-requests/${id}/withdraw`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handle<ExperienceChangeRequest>(res, 'Unable to withdraw change request.');
  },
  applyChangeRequest: async (token: string, id: number): Promise<ExperienceChangeRequest> => {
    const res = await fetch(`${API_BASE_URL}/experience-workflow/change-requests/${id}/apply`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handle<ExperienceChangeRequest>(res, 'Unable to apply change request.');
  },
};
