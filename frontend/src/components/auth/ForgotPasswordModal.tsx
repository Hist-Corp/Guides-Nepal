import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getApiUrl } from '../../config/api';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

/**
 * Generic success message shown regardless of whether the email exists in the
 * system. This is a deliberate security measure to prevent user enumeration —
 * an attacker cannot determine if an account exists by submitting different
 * email addresses.
 */
const GENERIC_SUCCESS_MESSAGE =
  'If an account exists for that email, we have sent a password reset link. Please check your inbox (and spam folder) for an email from Guides Nepal with instructions to reset your password.';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Freeze the page behind the modal so scrolling outside the card doesn't
  // move the blurred background (same pattern as CurrencyPickerModal).
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) validateEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      // Call our backend forgot-password endpoint. The backend will
      // ensure the user exists in Supabase Auth and send the reset email
      // via the Supabase Admin API. This is more reliable than calling
      // Supabase directly from the frontend because it does not depend on
      // the user already existing in Supabase Auth.
      const resp = await fetch(getApiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!resp.ok) {
        // Even if the backend returns an error, we treat it as success for
        // security reasons (prevent user enumeration).
        console.warn('Password reset request returned non-OK (not shown to user):', resp.status);
      }

      setStatus('success');
    } catch (err) {
      // This branch is only reached for local configuration errors (e.g.
      // backend unreachable), not for "email not found" cases.
      console.error('Failed to send password reset email:', err);
      setStatus('error');
      setErrorMessage('We could not process your request at the moment. Please try again later.');
    }
  };

  const handleClose = () => {
    // Reset state when closing so reopening shows a fresh form
    setStatus('idle');
    setEmail('');
    setEmailError(null);
    setErrorMessage(null);
    onClose();
  };

  const handleSwitchToLogin = () => {
    setStatus('idle');
    setEmail('');
    setEmailError(null);
    setErrorMessage(null);
    onSwitchToLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="relative m-auto w-full max-w-[560px] bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFF0E6] px-6 py-5 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-[#213448] shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#213448] mb-1">Reset your password</h2>
          <p className="text-gray-600">We'll email you a link to reset it</p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {status === 'success' ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                {GENERIC_SUCCESS_MESSAGE}
              </p>
              <button
                onClick={handleSwitchToLogin}
                className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Back to log in
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <span className="text-gray-500 text-sm">
                  Enter your account email and we'll send a link to reset your password.
                </span>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    autoFocus
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white ${
                      emailError ? 'border-red-500' : 'border-gray-200'
                    }`}
                    value={email}
                    onChange={handleEmailChange}
                    disabled={status === 'loading'}
                  />
                  {emailError && <div className="text-red-600 text-xs mt-1">{emailError}</div>}
                </div>

                {status === 'error' && errorMessage && (
                  <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              <div className="text-center mt-6 text-sm text-gray-500">
                <button
                  onClick={handleSwitchToLogin}
                  className="inline-flex items-center gap-1 text-[#213448] font-bold hover:text-brand-yellow transition-colors hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to log in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
