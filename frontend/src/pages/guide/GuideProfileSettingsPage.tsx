import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, FileText } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { useGoBack } from '../../utils/backNavigation';
import { guidesApi, type GuideProfileDocument } from '../../services/guidesApi';

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

const GuideProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack('/guide/dashboard');
  const { accessToken, isAuthenticated, user } = useAuthStore();

  const [docs, setDocs] = useState<GuideProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [certFile, setCertFile] = useState<File | null>(null);
  const [certLabel, setCertLabel] = useState('');

  const load = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const { profile_documents } = await guidesApi.getMyProfileDocs(accessToken);
      setDocs(profile_documents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load profile documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user?.role === 'guide') load();
  }, [accessToken, user?.role]);

  const onCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be no larger than 10 MB.');
      return;
    }
    setCertFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!certFile) {
      setError('Choose a certificate/image to upload.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const form = new FormData();
      form.append('certificate', certFile, certFile.name);
      if (certLabel.trim()) form.append('certificate_label', certLabel.trim());
      const { profile_documents } = await guidesApi.uploadCertificate(accessToken, form);
      setDocs(profile_documents ?? []);
      setSuccess('Certificate added to your profile.');
      setCertFile(null);
      setCertLabel('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save certificate.');
    } finally {
      setSaving(false);
    }
  };

  const removeDocument = async (documentId: number) => {
    if (!accessToken) return;
    if (!window.confirm('Remove this certificate from your profile?')) return;
    try {
      await guidesApi.deleteProfileDocument(accessToken, documentId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to remove certificate.');
    }
  };

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const name = user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : user?.email ?? 'You';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <div className="flex items-center gap-4 px-4 pt-6">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-[#213448] hover:text-[#213448] hover:shadow-md active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>
      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-grow px-4 py-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Upload certificates and images for your public guide profile.
        </p>

        {loading ? (
          <p className="mt-8 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </p>
        ) : success ? (
          <p className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-10">
            <section>
              <h2 className="font-bold text-gray-900">Upload certificate / image</h2>
              <p className="mt-1 text-sm text-gray-600">
                These appear on your public guide profile under{" "}
                <span className="font-medium">Certificates &amp; documents</span>.
              </p>
              <div className="mt-4 space-y-3">
                <div className="border-2 border-dashed rounded-xl border-gray-300 p-4">
                  <input
                    type="file"
                    accept={ACCEPT}
                    onChange={onCertChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    tabIndex={-1}
                    aria-hidden
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
                        <span className="text-sm font-medium text-gray-700">
                          Upload certificate
                        </span>
                        <span className="text-xs text-gray-400">
                          JPG, PNG, WebP or PDF, up to 10 MB
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={certLabel}
                    onChange={(e) => setCertLabel(e.target.value)}
                    placeholder="Label (optional)"
                    className="flex-1 rounded-xl border border-gray-300 p-3 text-sm"
                  />
                </div>
              </div>
            </section>

            {docs.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-gray-900">On your profile</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove a certificate if you no longer want it on your profile.
                </p>
                <ul className="mt-4 space-y-3">
                  {docs.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
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
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploaded_at).toLocaleDateString()} ·{' '}
                            {doc.content_type}
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
              </section>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving || !certFile}
                className="rounded-full bg-brand-yellow py-3 px-8 text-sm font-bold text-[#213448] hover:bg-[#ffba0a] disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save certificate'}
              </button>
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP or PDF, up to 10 MB.
              </p>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">What shows on your public profile</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              A <span className="font-medium">Certificates &amp; documents</span> section
              lists every certificate/image you uploaded.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              Each certificate also appears as a tile in the gallery on your profile
              page.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              Removing a certificate here hides it from your public profile.
            </li>
          </ul>
        </div>

        <Link to="/guide/dashboard" className="mt-8 inline-block text-sm font-bold text-primary hover:underline">
          Back to dashboard
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default GuideProfileSettingsPage;
