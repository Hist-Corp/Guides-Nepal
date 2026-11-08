import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { API_BASE_URL } from '../../config/api';
import { trackEvent } from '../../utils/analytics';
import { useGoBack } from '../../utils/backNavigation';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Lock,
  MapPin,
  Upload as UploadIcon,
  Users,
} from 'lucide-react';
import SelfieAuthentication from '../../components/guide/SelfieAuthentication';

type Draft = {
  // Step 0 — Basics
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  region: string;
  // Step 1 — Profile
  displayName: string;
  bio: string;
  languages: string;
  province: string;
  preferredGroupSize: string;
  profilePhotoUrl: string;
  // Step 2 — Experience
  yearsExperience: string;
  expertise: string;
  citiesCovered: string;
  guideLicenseNumber: string;
  experienceSummary: string;
  // Step 3 — Documents
  ninNumber: string;
  liveSelfieUrl: string;
  liveSelfieImages: { left: string; front: string; right: string };
  supplementaryDocs: string;
  // Step 4 — declarations
  terms: boolean;
  privacy: boolean;
  accuracy: boolean;
};

type FileKey =
  | 'citizenshipFront'
  | 'citizenshipBack'
  | 'liveSelfie'
  | 'holdingCitizenship'
  | 'certificate'
  | 'supplementaryDocs';

const empty: Draft = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  region: '',
  displayName: '',
  bio: '',
  languages: '',
  province: '',
  preferredGroupSize: '',
  profilePhotoUrl: '',
  yearsExperience: '',
  expertise: '',
  citiesCovered: '',
  guideLicenseNumber: '',
  experienceSummary: '',
  ninNumber: '',
  liveSelfieUrl: '',
  liveSelfieImages: { left: '', front: '', right: '' },
  supplementaryDocs: '',
  terms: false,
  privacy: false,
  accuracy: false,
};

const steps = ['Basics', 'Profile', 'Experience', 'Documents', 'Preview & Submit'];

const REGIONS = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

const loadDraft = (): Draft => {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem('gn-guide-registration-draft') || '{}') };
  } catch {
    return empty;
  }
};

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, msg: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), msg: '1 uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), msg: '1 number' },
  { test: (p: string) => /[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(p), msg: '1 special character' },
];

type FieldErrors = Record<string, string>;

const validateStep = (step: number, d: Draft, files: Record<FileKey, File | null>): FieldErrors => {
  const errors: FieldErrors = {};

  const required = (key: string, value: string, label: string) => {
    if (!value || !value.trim()) errors[key] = `${label} is required.`;
  };

  if (step === 0) {
    required('firstName', d.firstName, 'First name');
    required('lastName', d.lastName, 'Last name');
    if (!d.email.trim()) errors.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(d.email)) errors.email = 'Enter a valid email address.';
    required('password', d.password, 'Password');
    if (d.password && !PASSWORD_RULES.every((r) => r.test(d.password))) {
      errors.password =
        'Password must be 8+ chars with 1 uppercase, 1 number, 1 special character.';
    }
    if (d.password && d.confirmPassword && d.password !== d.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    } else if (!d.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password.';
    }
    required('region', d.region, 'Region');
  } else if (step === 1) {
    required('displayName', d.displayName, 'Display name');
    if (!d.bio.trim()) errors.bio = 'Bio is required.';
    else if (d.bio.trim().length < 30) errors.bio = 'Bio must be at least 30 characters.';
    required('languages', d.languages, 'Languages');
    if (!d.province.trim()) errors.province = 'Province is required.';
  } else if (step === 2) {
    required('yearsExperience', d.yearsExperience, 'Years of experience');
    if (!d.expertise.trim()) errors.expertise = 'Enter at least one area of expertise.';
    required('citiesCovered', d.citiesCovered, 'Cities covered');
    if (!d.experienceSummary.trim()) errors.experienceSummary = 'Experience summary is required.';
    else if (d.experienceSummary.trim().length < 30) {
      errors.experienceSummary = 'Experience summary must be at least 30 characters.';
    }
  } else if (step === 3) {
    required('ninNumber', d.ninNumber, 'National ID number');
    if (!files.citizenshipFront) errors.citizenshipFront = 'Citizenship (front) is required.';
    if (!files.citizenshipBack) errors.citizenshipBack = 'Citizenship (back) is required.';
    if (!d.liveSelfieImages.front) errors.liveSelfie = 'Live selfie is required.';
    if (!files.holdingCitizenship)
      errors.holdingCitizenship = 'Photo holding citizenship is required.';
    if (!files.certificate) errors.certificate = 'Guide certificate is required.';
    if (!files.supplementaryDocs)
      errors.supplementaryDocs = 'Supplementary documents are required.';
  } else if (step === 4) {
    if (!d.terms) errors.terms = 'You must accept the terms and conditions.';
    if (!d.privacy) errors.privacy = 'You must consent to document processing.';
    if (!d.accuracy) errors.accuracy = 'You must confirm the information is accurate.';
  }

  return errors;
};

export default function GuideRegistrationWizard() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [files, setFiles] = useState<Record<FileKey, File | null>>({
    citizenshipFront: null,
    citizenshipBack: null,
    liveSelfie: null,
    holdingCitizenship: null,
    certificate: null,
    supplementaryDocs: null,
  });
  const [previewUrls, setPreviewUrls] = useState<Record<FileKey, string>>({
    citizenshipFront: '',
    citizenshipBack: '',
    liveSelfie: '',
    holdingCitizenship: '',
    certificate: '',
    supplementaryDocs: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState<number | null>(null);
  const [showSelfieAuth, setShowSelfieAuth] = useState(false);

  const update = (key: keyof Draft, value: string | boolean) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    localStorage.setItem('gn-guide-registration-draft', JSON.stringify(next));
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const chooseFile = (key: FileKey, value: File | null) => {
    if (value && value.size > 10 * 1024 * 1024) {
      setServerError('Each document must be smaller than 10 MB.');
      return;
    }
    if (
      value &&
      !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(value.type)
    ) {
      setServerError('Documents must be PDF, JPG, PNG, or WebP files.');
      return;
    }
    setServerError('');
    setFiles((v) => ({ ...v, [key]: value }));
    if (value && value.type.startsWith('image/')) {
      setPreviewUrls((prev) => {
        if (prev[key]) URL.revokeObjectURL(prev[key]);
        return { ...prev, [key]: URL.createObjectURL(value) };
      });
    } else if (previewUrls[key]) {
      URL.revokeObjectURL(previewUrls[key]);
      setPreviewUrls((prev) => ({ ...prev, [key]: '' }));
    }
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const chooseProfilePhoto = (value: File | null) => {
    if (value && value.size > 5 * 1024 * 1024) {
      setServerError('Profile photo must be smaller than 5 MB.');
      return;
    }
    if (value && !value.type.startsWith('image/')) {
      setServerError('Profile photo must be an image.');
      return;
    }
    setServerError('');
    if (draft.profilePhotoUrl) URL.revokeObjectURL(draft.profilePhotoUrl);
    setProfilePhotoFile(value);
    update('profilePhotoUrl', value ? URL.createObjectURL(value) : '');
  };

  const next = () => {
    const errors = validateStep(step, draft, files);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      trackEvent('guide_registration_step_error', { step });
      return;
    }
    trackEvent('guide_registration_step_completed', { step });
    setFieldErrors({});
    setServerError('');
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = async () => {
    const errors = validateStep(4, draft, files);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setBusy(true);
    setFieldErrors({});
    setServerError('');
    try {
      // Convert live selfie data URL to Blob for submission
      let liveSelfieFile: File | null = null;
      if (draft.liveSelfieUrl) {
        const matches = draft.liveSelfieUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);
        if (matches) {
          const mime = matches[1];
          const b64 = matches[2];
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          liveSelfieFile = new File([bytes], `selfie-${Date.now()}.jpg`, { type: mime });
        }
      }
      const body = new FormData();
      body.append('full_name', `${draft.firstName.trim()} ${draft.lastName.trim()}`);
      body.append('email', draft.email.trim().toLowerCase());
      body.append('password', draft.password);
      body.append('region', draft.region);
      body.append('city', draft.citiesCovered?.split(',')[0].trim() || draft.region);
      if (draft.phone) body.append('phone', draft.phone.trim());
      if (draft.ninNumber) body.append('nin_number', draft.ninNumber.trim());
      body.append(
        'documents',
        JSON.stringify({
          profile: {
            displayName: draft.displayName,
            bio: draft.bio,
            languages: draft.languages,
            province: draft.province,
            preferredGroupSize: draft.preferredGroupSize,
            expertise: draft.yearsExperience,
            citiesCovered: draft.citiesCovered,
            guideLicenseNumber: draft.guideLicenseNumber,
            experienceSummary: draft.experienceSummary,
            profilePhoto: draft.profilePhotoUrl,
            liveSelfieImages: draft.liveSelfieImages,
          },
        })
      );
      // Append uploaded document files
      Object.entries(files).forEach(([k, v]) => {
        if (v) body.append(k, v);
      });
      // Append live selfie file (captured selfie image)
      if (liveSelfieFile) {
        body.append('liveSelfie', liveSelfieFile);
      }
      const result = await axios.post(`${API_BASE_URL}/guide-applications`, body, {
        timeout: 30000,
      });
      trackEvent('guide_registration_submitted', { application_id: result.data.id });
      setComplete(result.data.id);
      localStorage.removeItem('gn-guide-registration-draft');
    } catch (e: unknown) {
      const response = (e as { response?: { data?: { detail?: string } } }).response;
      setServerError(
        response?.data?.detail || 'We could not submit your application. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (complete !== null)
    return (
      <Shell>
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm md:p-14">
          <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-600" />
          <h1 className="text-3xl font-bold text-[#213448]">Application submitted</h1>
          <p className="mt-4 text-gray-600">
            Thank you, {draft.firstName}. Your reference is GU-
            {String(complete).padStart(6, '0')}. We will contact you at {draft.email} after a
            regional head reviews your application and documents. Your login becomes active once you
            are approved to guide.
          </p>
          <Button className="mt-8" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <button
        onClick={goBack}
        className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="rounded-3xl bg-white p-5 shadow-sm md:p-10">
        <h1 className="text-3xl font-bold text-[#213448]">Guide registration</h1>
        <p className="mt-2 text-gray-600">
          Join our community of authentic local experts. Complete each section. Your progress is
          saved on this device.
        </p>

        <div className="my-8 grid grid-cols-5 gap-2 relative">
          {/* Straight line crossing through the middle of the circles (behind circles) */}
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0" />

          {steps.map((name, i) => (
            <div key={name} className="text-center relative z-10">
              <div
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 z-10 ${i < step ? 'bg-emerald-600 text-white border border-emerald-600 shadow-lg shadow-emerald-200' : i === step ? 'bg-[#213448] text-white border border-[#213448] shadow-lg shadow-[#213448]/20' : 'bg-white text-gray-400 border border-slate-300'}`}
              >
                {i + 1}
              </div>
              <p
                className={`mt-2 text-xs font-medium ${i < step || i === step ? 'text-[#213448]' : 'text-gray-400'} sm:block`}
              >
                {name}
              </p>
            </div>
          ))}
        </div>

        {/* Registration Progress */}
        <div className="my-6">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span className="text-gray-600">Registration Progress</span>
            <span className="text-[#213448] font-bold">
              {Math.round((step / (steps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-[#213448] transition-all duration-500"
              style={{ width: `${Math.round((step / (steps.length - 1)) * 100)}%` }}
            />
          </div>
        </div>

        {serverError && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
        {step === 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="First name"
              value={draft.firstName}
              onChange={(v) => update('firstName', v)}
              placeholder="e.g. Pasang"
              error={fieldErrors.firstName}
              required
            />
            <Input
              label="Last name"
              value={draft.lastName}
              onChange={(v) => update('lastName', v)}
              placeholder="e.g. Sherpa"
              error={fieldErrors.lastName}
              required
            />
            <Input
              label="Email address"
              type="email"
              value={draft.email}
              onChange={(v) => update('email', v)}
              placeholder="pasang@example.com"
              error={fieldErrors.email}
              required
            />
            <Input
              label="Phone number"
              type="tel"
              value={draft.phone}
              onChange={(v) => update('phone', v)}
              placeholder="+977 98XXXXXXXX"
            />
            <label className="font-medium text-sm text-gray-700">
              Region (assigned regional head)
              <Select
                value={draft.region}
                onChange={(e) => update('region', e.target.value)}
                error={fieldErrors.region}
                required
              >
                <option value="">Select your region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </label>
            <PasswordInput
              label="Create a password"
              value={draft.password}
              onChange={(v) => update('password', v)}
              placeholder="8+ chars, 1 uppercase, 1 number, 1 symbol"
              error={fieldErrors.password}
              required
            />
            <PasswordInput
              label="Confirm password"
              value={draft.confirmPassword}
              onChange={(v) => update('confirmPassword', v)}
              placeholder="Repeat your password"
              error={fieldErrors.confirmPassword}
              required
            />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Display name"
                value={draft.displayName}
                onChange={(v) => update('displayName', v)}
                placeholder="e.g. Pasang Sherpa"
                error={fieldErrors.displayName}
                required
              />
              <Input
                label="Languages"
                value={draft.languages}
                onChange={(v) => update('languages', v)}
                placeholder="Nepali, English"
                error={fieldErrors.languages}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#213448]/10 bg-[#213448]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-[#213448]" />
                  <label className="font-medium text-sm text-[#213448]">Guide province</label>
                </div>
                <Select
                  value={draft.province}
                  onChange={(e) => update('province', e.target.value)}
                  error={fieldErrors.province}
                >
                  <option value="">Select province</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="rounded-xl border border-[#213448]/10 bg-[#213448]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-[#213448]" />
                  <label className="font-medium text-sm text-[#213448]">Preferred group size</label>
                </div>
                <Select
                  value={draft.preferredGroupSize}
                  onChange={(e) => update('preferredGroupSize', e.target.value)}
                  error={fieldErrors.preferredGroupSize}
                >
                  <option value="">Select group size</option>
                  <option value="1-4">1-4 travelers</option>
                  <option value="5-8">5-8 travelers</option>
                  <option value="9+">9+ travelers</option>
                  <option value="flexible">Flexible / any size</option>
                </Select>
              </div>
            </div>
            <Textarea
              label="Bio"
              value={draft.bio}
              onChange={(v) => update('bio', v)}
              placeholder="What makes your guiding special?"
              error={fieldErrors.bio}
              required
            />
            <div className="rounded-xl border border-dashed border-gray-300 p-4">
              <p className="font-medium text-sm text-gray-700 mb-2">Profile photo</p>
              <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold inline-block">
                <UploadIcon className="mr-1 inline h-4 w-4" />
                Choose file
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => chooseProfilePhoto(e.target.files?.[0] ?? null)}
                />
              </label>
              {profilePhotoFile && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={draft.profilePhotoUrl}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                  <button
                    className="text-xs text-red-600 underline underline-offset-4 hover:text-red-800"
                    onClick={() => {
                      setProfilePhotoFile(null);
                      update('profilePhotoUrl', '');
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">JPG or PNG · max 5 MB</p>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Years of guiding experience"
                type="number"
                value={draft.yearsExperience}
                onChange={(v) => update('yearsExperience', v)}
                placeholder="e.g. 8"
                error={fieldErrors.yearsExperience}
                required
              />
              <Input
                label="Areas of expertise"
                value={draft.expertise}
                onChange={(v) => update('expertise', v)}
                placeholder="e.g. Trekking, Cultural tours, Food tours"
                error={fieldErrors.expertise}
                required
              />
              <Input
                label="Cities / areas covered"
                value={draft.citiesCovered}
                onChange={(v) => update('citiesCovered', v)}
                placeholder="Kathmandu, Pokhara, Chitwan"
                error={fieldErrors.citiesCovered}
                required
              />
              <Input
                label="Guide license number"
                value={draft.guideLicenseNumber}
                onChange={(v) => update('guideLicenseNumber', v)}
                placeholder="e.g. GUIDE-2024-0123"
                error={fieldErrors.guideLicenseNumber}
              />
            </div>
            <Textarea
              label="Guiding experience summary"
              value={draft.experienceSummary}
              onChange={(v) => update('experienceSummary', v)}
              placeholder="Describe your professional background and guiding history."
              error={fieldErrors.experienceSummary}
              required
            />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#213448]/5 p-6 border border-[#213448]/10">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-[#213448]" />
                <h2 className="text-xl font-bold text-[#213448]">Identity Verification</h2>
              </div>
              <p className="text-gray-600 mb-0">
                Upload clear copies of your identity documents for verification. Accepted: PDF, JPG,
                PNG, or WebP (max 10 MB each). Your login becomes active once a regional head
                reviews and approves your application.
              </p>
            </div>

            {/* National ID Number */}
            <div className="rounded-xl border border-e2e8f0 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#213448]" />
                <h3 className="font-semibold text-sm text-[#213448]">National ID Number</h3>
              </div>
              <Input
                label="National ID number"
                value={draft.ninNumber}
                onChange={(v) => update('ninNumber', v)}
                placeholder="Enter your National ID number"
                error={fieldErrors.ninNumber}
                required
              />
            </div>

            {/* Phase 1: Identity Documents */}
            <div className="rounded-xl border border-e2e8f0 bg-white p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#213448]" />
                <h3 className="font-semibold text-sm text-[#213448]">
                  Phase 1 — Identity Documents
                </h3>
                <span className="ml-auto text-[10px] font-bold text-emerald-600">1 of 3</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadCard
                  label="Citizenship (Front)"
                  required
                  value={files.citizenshipFront}
                  previewUrl={previewUrls.citizenshipFront}
                  onFile={(f) => chooseFile('citizenshipFront', f)}
                  error={fieldErrors.citizenshipFront}
                />
                <UploadCard
                  label="Citizenship (Back)"
                  required
                  value={files.citizenshipBack}
                  previewUrl={previewUrls.citizenshipBack}
                  onFile={(f) => chooseFile('citizenshipBack', f)}
                  error={fieldErrors.citizenshipBack}
                />
              </div>
            </div>

            {/* Phase 2: Biometric Verification */}
            <div className="rounded-xl border border-e2e8f0 bg-white p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-[#213448]" />
                <h3 className="font-semibold text-sm text-[#213448]">
                  Phase 2 — Biometric Verification
                </h3>
                <span className="ml-auto text-[10px] font-bold text-emerald-600">2 of 3</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadCard
                  label="Photo Holding Citizenship"
                  required
                  value={files.holdingCitizenship}
                  previewUrl={previewUrls.holdingCitizenship}
                  onFile={(f) => chooseFile('holdingCitizenship', f)}
                  accept="image/*"
                  error={fieldErrors.holdingCitizenship}
                />
                <div
                  className={`flex flex-col relative rounded-xl border border-e2e8f0 bg-white p-5 transition-all duration-200 shadow-sm ${fieldErrors.liveSelfie ? 'border-red-500 bg-red-50 shadow-sm' : ''}`}
                  style={{ borderRadius: '8px' }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-800">Live Selfie</span>
                      <span className="text-[10px] font-bold text-red-600">*</span>
                    </div>
                    {fieldErrors.liveSelfie && (
                      <span className="text-[10px] text-red-600 font-medium">
                        {fieldErrors.liveSelfie}
                      </span>
                    )}
                  </div>

                  <p className="text-[0.75rem] text-slate-600 text-left mb-3 leading-tight">
                    Take 3 photos: left, front, right
                  </p>

                  <div className="flex-1 flex items-center justify-center gap-3 min-h-[160px]">
                    <div
                      className={`aspect-[4/3] rounded-lg overflow-hidden border transition-colors duration-200 ${draft.liveSelfieUrl ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-50 border border-slate-300 border-dashed'}`}
                    >
                      {draft.liveSelfieUrl ? (
                        <img
                          src={draft.liveSelfieUrl}
                          alt="Live selfie"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-slate-400 h-full">
                          <Camera className="w-8 h-8 text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-500">
                            {draft.liveSelfieImages.front ? 'Selfie captured' : 'Capture selfie'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-medium ${draft.liveSelfieImages.front ? 'text-emerald-600' : 'text-slate-500'}`}
                  >
                    {draft.liveSelfieImages.front ? 'Selfie captured' : 'Capture selfie'}
                  </span>

                  <div className="mt-auto flex items-center justify-between gap-2 w-full px-2 pt-3">
                    <button
                      className="flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold tracking-tight transition-all duration-200 bg-[#213448] text-white border-[#213448] hover:bg-[#213448]/90 shadow-sm"
                      onClick={() => {
                        setShowSelfieAuth(true);
                      }}
                    >
                      {draft.liveSelfieImages.front ? 'Retake' : 'Capture selfie'}
                    </button>
                    {draft.liveSelfieImages.front && (
                      <button
                        className="text-[10px] text-red-400 font-medium hover:text-red-600 underline underline-offset-4 transition-colors"
                        onClick={() => {
                          setDraft((prev) => ({
                            ...prev,
                            liveSelfieUrl: '',
                            liveSelfieImages: { left: '', front: '', right: '' },
                          }));
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3: Professional Credentials */}
            <div className="rounded-xl border border-e2e8f0 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-[#213448]" />
                <h3 className="font-semibold text-sm text-[#213448]">
                  Phase 3 — Professional Credentials
                </h3>
                <span className="ml-auto text-[10px] font-bold text-emerald-600">3 of 3</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadCard
                  label="Guide Certificate"
                  required
                  value={files.certificate}
                  previewUrl={previewUrls.certificate}
                  onFile={(f) => chooseFile('certificate', f)}
                  error={fieldErrors.certificate}
                />
                <UploadCard
                  label="Supplementary Documents"
                  required
                  value={files.supplementaryDocs}
                  previewUrl={previewUrls.supplementaryDocs}
                  onFile={(f) => chooseFile('supplementaryDocs', f)}
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  error={fieldErrors.supplementaryDocs}
                  hint="Accepted: PDF, DOC, DOCX, XLS, XLSX, CSV (max 10 MB)"
                />
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-[#213448]">Review your application</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please review everything before you submit. Changes can be made using the Back button.
            </p>
            <div className="mt-5 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
              {[
                ['Applicant', `${draft.firstName} ${draft.lastName}`],
                ['Display name', draft.displayName || '—'],
                ['National ID', draft.ninNumber || '—'],
                ['Contact', `${draft.email} · ${draft.phone || '—'}`],
                ['Region', draft.region || '—'],
                ['Languages', draft.languages || '—'],
                ['Province', draft.province || '—'],
                ['Preferred group size', draft.preferredGroupSize || '—'],
                ['Expertise', draft.expertise || '—'],
                ['Cities covered', draft.citiesCovered || '—'],
                ['Guide license', draft.guideLicenseNumber || '—'],
                ['Experience', `${draft.yearsExperience || '—'} years`],
              ].map(([a, b]) => (
                <div className="rounded-xl bg-gray-50 p-4" key={a}>
                  <b>{a}</b>
                  <p className="mt-1">{b}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-xl bg-gray-50 p-4">
                <b>Guiding experience summary</b>
                <p className="mt-1 whitespace-pre-wrap">{draft.experienceSummary || '—'}</p>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-gray-50 p-4">
                <b>Bio</b>
                <p className="mt-1 whitespace-pre-wrap">{draft.bio || '—'}</p>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-gray-50 p-4">
                <b>Profile photo</b>
                {draft.profilePhotoUrl ? (
                  <img
                    src={draft.profilePhotoUrl}
                    alt="Profile photo"
                    className="mt-1 w-20 h-20 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <p className="mt-1 text-xs text-gray-400">—</p>
                )}
              </div>
              <div className="sm:col-span-2 rounded-xl bg-gray-50 p-4">
                <b>Documents</b>
                <p className="mt-1">
                  {[
                    files.citizenshipFront ? 'Citizenship (front)' : null,
                    files.citizenshipBack ? 'Citizenship (back)' : null,
                    draft.liveSelfieImages.front ? 'Live selfie' : null,
                    files.holdingCitizenship ? 'Photo holding citizenship' : null,
                    files.certificate ? 'Guide certificate' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'No documents attached yet.'}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={draft.terms}
                  onChange={(e) => update('terms', e.target.checked)}
                />
                I accept the terms and conditions.
                {fieldErrors.terms && (
                  <span className="ml-2 text-xs text-red-600">{fieldErrors.terms}</span>
                )}
              </label>
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={draft.privacy}
                  onChange={(e) => update('privacy', e.target.checked)}
                />
                I consent to verification and processing of my documents.
                {fieldErrors.privacy && (
                  <span className="ml-2 text-xs text-red-600">{fieldErrors.privacy}</span>
                )}
              </label>
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={draft.accuracy}
                  onChange={(e) => update('accuracy', e.target.checked)}
                />
                I confirm that the information provided is accurate.
                {fieldErrors.accuracy && (
                  <span className="ml-2 text-xs text-red-600">{fieldErrors.accuracy}</span>
                )}
              </label>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={step === 4 ? submit : next} disabled={busy}>
            {step === 4 ? (
              busy ? (
                'Submitting…'
              ) : (
                'Submit application'
              )
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">
        By submitting this form, you agree to our{' '}
        <a href="/terms" className="text-[#213448] hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-[#213448] hover:underline">
          Privacy Policy
        </a>
        .
      </p>
      {showSelfieAuth && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <SelfieAuthentication
            onComplete={(data) => {
              setDraft((prev) => ({
                ...prev,
                liveSelfieUrl: data.front,
                liveSelfieImages: data,
              }));
              setShowSelfieAuth(false);
            }}
            onCancel={() => setShowSelfieAuth(false)}
          />
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">{children}</main>
      <Footer />
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="font-medium text-sm text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
      <input
        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="font-medium text-sm text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
      <div className="mt-2 relative w-full">
        <input
          className="w-full rounded-xl border border-gray-300 p-3 pr-11"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#213448] focus:outline-none"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="font-medium text-sm text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-gray-300 p-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
  error,
  required = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <>
      {required && <span className="text-red-600">*</span>}
      <div className="mt-2 relative w-full group">
        <select
          className="appearance-none w-full rounded-xl border border-gray-300 p-3 pr-11"
          value={value}
          onChange={onChange}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#213448] group-hover:text-[#213448]/80 pointer-events-none transition-colors" />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
  );
}

function UploadCard({
  label,
  required,
  value,
  previewUrl,
  onFile,
  error,
  accept = 'application/pdf,image/jpeg,image/png,image/webp',
  hint,
}: {
  label: string;
  required?: boolean;
  value: File | null;
  previewUrl?: string;
  onFile: (f: File | null) => void;
  error?: string;
  accept?: string;
  hint?: string;
}) {
  const isImage = value ? value.type.startsWith('image/') : false;
  const isPDF = value ? value.type === 'application/pdf' : false;
  const hasValue = !!value;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCardClick = () => {
    if (hasValue) return; // Only allow box click when no file yet; use "Replace" button otherwise
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex flex-col rounded-xl border border-e2e8f0 bg-white p-4 transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-slate-800">{label}</span>
          {required && <span className="text-[10px] font-bold text-red-600">*</span>}
        </div>
        {error && <span className="text-[10px] text-red-600 font-medium">{error}</span>}
        {hint && (
          <p className="text-[0.7rem] text-slate-500 text-left mb-3 leading-tight">{hint}</p>
        )}
      </div>

      {/* Large aspect-ratio landscape preview area - clickable to upload when empty */}
      <div
        className={`flex-1 flex flex-col items-center justify-center gap-3 transition-colors duration-200 ${
          hasValue ? 'cursor-default' : 'cursor-pointer'
        }`}
        onClick={handleCardClick}
      >
        {hasValue && previewUrl && isImage ? (
          <div className="aspect-[4/3] w-full rounded-[8px] overflow-hidden border border-slate-200 bg-slate-50">
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          </div>
        ) : hasValue && previewUrl && isPDF ? (
          <div className="aspect-[4/3] w-full rounded-[8px] flex items-center justify-center border border-slate-200 bg-slate-50">
            <FileText className="w-12 h-12 text-emerald-600" />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full rounded-[8px] flex items-center justify-center border border-dashed border-slate-300 bg-slate-50/50">
            <UploadIcon className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <span className={`text-xs font-medium ${hasValue ? 'text-emerald-600' : 'text-slate-500'}`}>
          {hasValue ? (isImage ? 'Image added' : 'File added') : 'Add file'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept={accept}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {/* Action buttons at bottom */}
      <div className="flex items-center justify-between gap-2 w-full px-2 pt-3">
        <button
          type="button"
          onClick={handleCardClick}
          className={`cursor-pointer rounded-lg border px-3 py-2 text-[10px] font-medium tracking-tight transition-all duration-200 group border-slate-300 text-slate-700 bg-white hover:border-[#213448]/50 hover:bg-[#213448]/5 ${hasValue ? 'border-[#213448] text-[#213448] bg-[#213448]/5' : ''}`}
        >
          {hasValue ? 'Replace' : 'Choose file'}
        </button>
        {value && (
          <button
            type="button"
            className="text-[10px] text-red-400 font-medium hover:text-red-600 underline underline-offset-4 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onFile(null);
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Small file name badge at bottom */}
      {value && !error && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <span className="text-[0.75rem] text-slate-500 truncate block leading-none">
            {value.name}
          </span>
        </div>
      )}
    </div>
  );
}
