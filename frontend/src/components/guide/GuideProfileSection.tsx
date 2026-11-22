import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Upload, Trash2, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { guidesApi, type GuideProfileDocument } from '../../services/guidesApi';
import InlineMessage, { type InlineMessageType } from '../common/InlineMessage';
import { subscribeGuideDraft, writeGuideDraft } from '../../utils/guideProfileDraft';

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
const MAX_BYTES = 10 * 1024 * 1024;

const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8';
const labelClass = 'block text-xs font-bold text-gray-600 uppercase mb-1';
const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow';
const primaryButtonClass =
  'px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50';

type Status = { type: InlineMessageType; text: string };

/** Prefer the backend's error detail over axios' "Request failed with status code N". */
const errorText = (e: unknown, fallback: string): string => {
  if (axios.isAxiosError(e) && typeof e.response?.data?.detail === 'string') {
    return e.response.data.detail;
  }
  return e instanceof Error ? e.message : fallback;
};

interface GuideProfileSectionProps {
  /** Reports the guide's public profile slug so the page can open its preview. */
  onPublicSlugChange?: (slug: string) => void;
}

/**
 * Guide-only part of the account page: the "Trip Support" text and the
 * certificates/documents that render on the guide's public profile.
 */
const GuideProfileSection: React.FC<GuideProfileSectionProps> = ({ onPublicSlugChange }) => {
  const { accessToken, user } = useAuthStore();
  const email = user?.email;

  const [docs, setDocs] = useState<GuideProfileDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsMsg, setDocsMsg] = useState<Status | null>(null);
  const [uploading, setUploading] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certLabel, setCertLabel] = useState('');

  const [supportText, setSupportText] = useState('');
  const [savingSupport, setSavingSupport] = useState(false);
  const [supportMsg, setSupportMsg] = useState<Status | null>(null);

  const loadDocs = async () => {
    if (!accessToken) return;
    setLoadingDocs(true);
    setDocsMsg(null);
    try {
      const { profile_documents, trip_support, public_slug } =
        await guidesApi.getMyProfileDocs(accessToken);
      setDocs(profile_documents ?? []);
      setSupportText(trip_support ?? '');
      if (public_slug) onPublicSlugChange?.(public_slug);
      writeGuideDraft(email, { tripSupport: trip_support ?? '' }, 'account');
    } catch (e) {
      setDocsMsg({ type: 'error', text: errorText(e, 'Unable to load your profile documents.') });
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Keep the textarea in step when the trip support is edited in the preview.
  useEffect(() => {
    if (!email) return;
    return subscribeGuideDraft(email, (draft, source) => {
      if (source === 'preview' && draft.tripSupport !== undefined) {
        setSupportText(draft.tripSupport);
      }
    });
  }, [email]);

  const onCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setCertFile(null);
      setDocsMsg({ type: 'error', text: 'File must be no larger than 10 MB.' });
      return;
    }
    setCertFile(file);
    setDocsMsg(null);
  };

  const saveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !certFile) return;
    setUploading(true);
    setDocsMsg(null);
    try {
      const form = new FormData();
      form.append('certificate', certFile, certFile.name);
      if (certLabel.trim()) form.append('certificate_label', certLabel.trim());
      const { profile_documents } = await guidesApi.uploadCertificate(accessToken, form);
      setDocs(profile_documents ?? []);
      setDocsMsg({ type: 'ok', text: 'Certificate added to your profile.' });
      setCertFile(null);
      setCertLabel('');
    } catch (e) {
      setDocsMsg({ type: 'error', text: errorText(e, 'Unable to save certificate.') });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId: number) => {
    if (!accessToken || !window.confirm('Remove this certificate from your profile?')) return;
    try {
      await guidesApi.deleteProfileDocument(accessToken, documentId);
      await loadDocs();
    } catch (e) {
      setDocsMsg({ type: 'error', text: errorText(e, 'Unable to remove certificate.') });
    }
  };

  const saveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSavingSupport(true);
    setSupportMsg(null);
    try {
      const { trip_support } = await guidesApi.updateTripSupport(accessToken, supportText);
      setSupportText(trip_support ?? '');
      writeGuideDraft(email, { tripSupport: trip_support ?? '' }, 'account');
      setSupportMsg({ type: 'ok', text: 'Saved. This now shows on your public profile.' });
    } catch (e) {
      setSupportMsg({ type: 'error', text: errorText(e, 'Unable to save trip support.') });
    } finally {
      setSavingSupport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trip Support */}
      <section className={cardClass}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Trip Support</h2>
        <p className="text-sm text-gray-500 mb-4">
          Write how you support travellers during a trip — help with plans, on-trip questions,
          arrival pickup. This text appears on your public guide profile under{' '}
          <span className="font-medium">Trip Support</span>.
        </p>

        {supportMsg && <InlineMessage type={supportMsg.type} text={supportMsg.text} />}

        <form onSubmit={saveSupport}>
          <textarea
            rows={5}
            maxLength={1000}
            value={supportText}
            onChange={(e) => {
              setSupportText(e.target.value);
              writeGuideDraft(email, { tripSupport: e.target.value }, 'account');
            }}
            placeholder="e.g. I stay reachable on WhatsApp for the whole trip, help with permits and rescheduling, and can meet you at the airport."
            className={inputClass + ' resize-y'}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500">{supportText.length}/1000</span>
            <button type="submit" disabled={savingSupport} className={primaryButtonClass}>
              {savingSupport ? 'Saving...' : 'Save trip support'}
            </button>
          </div>
        </form>
      </section>

      {/* Certificates & documents */}
      <section className={cardClass}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Certificates &amp; documents</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload certificates for your public guide profile. Each one also appears as a tile in
          your profile gallery.
        </p>

        {docsMsg && <InlineMessage type={docsMsg.type} text={docsMsg.text} />}

        <form onSubmit={saveCertificate} className="space-y-3">
          <div className="relative border-2 border-dashed rounded-xl border-gray-300 p-4">
            <input
              type="file"
              accept={ACCEPT}
              onChange={onCertChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Certificate or document file"
            />
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <Upload className="h-5 w-5" />
              </div>
              {certFile ? (
                <span className="text-sm font-medium text-green-600 truncate max-w-[240px]">
                  {certFile.name}
                </span>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-700">Upload certificate</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP or PDF, up to 10 MB</span>
                </>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Label (optional)</label>
            <input
              type="text"
              value={certLabel}
              onChange={(e) => setCertLabel(e.target.value)}
              placeholder="e.g. Trekking guide licence"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !certFile}
            className={`w-full sm:w-auto text-center ${primaryButtonClass}`}
          >
            {uploading ? 'Saving...' : 'Add certificate'}
          </button>
        </form>

        {loadingDocs ? (
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        ) : (
          docs.length > 0 && (
            <ul className="mt-5 space-y-3">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-white flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                      {doc.content_type.startsWith('image/') ? (
                        <img
                          src={`/uploads/guide-profiles/${doc.stored_name}`}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleDateString()} · {doc.content_type}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="inline h-3.5 w-3.5 mr-1" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </section>
    </div>
  );
};

export default GuideProfileSection;
