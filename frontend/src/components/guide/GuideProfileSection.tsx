import React, { useEffect, useState } from 'react';
import { Upload, Trash2, FileText, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { guidesApi, type GuideProfileDocument } from '../../services/guidesApi';

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8';
const labelClass = 'block text-xs font-bold text-gray-600 uppercase mb-1';
const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow';

const Message: React.FC<{ msg: { type: 'ok' | 'error'; text: string } }> = ({ msg }) => (
  <div
    className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
      msg.type === 'ok'
        ? 'bg-green-50 border border-green-200 text-green-700'
        : 'bg-red-50 border border-red-200 text-red-700'
    }`}
  >
    {msg.type === 'ok' ? (
      <Check className="w-4 h-4 mt-0.5 shrink-0" />
    ) : (
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    )}
    <span className="min-w-0 break-words">{msg.text}</span>
  </div>
);

/**
 * Guide-only part of the account page: the "Trip Support" text and the
 * certificates/documents that render on the guide's public profile.
 */
const GuideProfileSection: React.FC = () => {
  const { accessToken } = useAuthStore();

  const [docs, setDocs] = useState<GuideProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [supportText, setSupportText] = useState('');
  const [supportSaving, setSupportSaving] = useState(false);
  const [supportMsg, setSupportMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [certFile, setCertFile] = useState<File | null>(null);
  const [certLabel, setCertLabel] = useState('');
  const [certSaving, setCertSaving] = useState(false);
  const [certMsg, setCertMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const load = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const { profile_documents, trip_support } = await guidesApi.getMyProfileDocs(accessToken);
      setDocs(profile_documents ?? []);
      setSupportText(trip_support ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load your profile documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const onCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setCertMsg({ type: 'error', text: 'File must be no larger than 10 MB.' });
      return;
    }
    setCertFile(file);
    setCertMsg(null);
  };

  const saveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!certFile) {
      setCertMsg({ type: 'error', text: 'Choose a certificate/image to upload.' });
      return;
    }
    setCertSaving(true);
    setCertMsg(null);
    try {
      const form = new FormData();
      form.append('certificate', certFile, certFile.name);
      if (certLabel.trim()) form.append('certificate_label', certLabel.trim());
      const { profile_documents } = await guidesApi.uploadCertificate(accessToken, form);
      setDocs(profile_documents ?? []);
      setCertMsg({ type: 'ok', text: 'Certificate added to your profile.' });
      setCertFile(null);
      setCertLabel('');
    } catch (e) {
      setCertMsg({
        type: 'error',
        text: e instanceof Error ? e.message : 'Unable to save certificate.',
      });
    } finally {
      setCertSaving(false);
    }
  };

  const saveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSupportSaving(true);
    setSupportMsg(null);
    try {
      const { trip_support } = await guidesApi.updateTripSupport(accessToken, supportText);
      setSupportText(trip_support ?? '');
      setSupportMsg({ type: 'ok', text: 'Saved. This now shows on your public profile.' });
    } catch (e) {
      setSupportMsg({
        type: 'error',
        text: e instanceof Error ? e.message : 'Unable to save trip support.',
      });
    } finally {
      setSupportSaving(false);
    }
  };

  const removeDocument = async (documentId: number) => {
    if (!accessToken) return;
    if (!window.confirm('Remove this certificate from your profile?')) return;
    try {
      await guidesApi.deleteProfileDocument(accessToken, documentId);
      await load();
    } catch (e) {
      setCertMsg({
        type: 'error',
        text: e instanceof Error ? e.message : 'Unable to remove certificate.',
      });
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

        {supportMsg && <Message msg={supportMsg} />}

        <form onSubmit={saveSupport}>
          <textarea
            rows={5}
            maxLength={1000}
            value={supportText}
            onChange={(e) => setSupportText(e.target.value)}
            placeholder="e.g. I stay reachable on WhatsApp for the whole trip, help with permits and rescheduling, and can meet you at the airport."
            className={inputClass + ' resize-y'}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500">{supportText.length}/1000</span>
            <button
              type="submit"
              disabled={supportSaving}
              className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
            >
              {supportSaving ? 'Saving...' : 'Save trip support'}
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

        {error && <Message msg={{ type: 'error', text: error }} />}
        {certMsg && <Message msg={certMsg} />}

        <form onSubmit={saveCertificate} className="space-y-3">
          <div className="relative border-2 border-dashed rounded-xl border-gray-300 p-4">
            <input
              type="file"
              accept={ACCEPT}
              onChange={onCertChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              tabIndex={-1}
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
            disabled={certSaving || !certFile}
            className="w-full sm:w-auto text-center px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
          >
            {certSaving ? 'Saving...' : 'Add certificate'}
          </button>
        </form>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        ) : docs.length > 0 ? (
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
        ) : null}
      </section>
    </div>
  );
};

export default GuideProfileSection;
