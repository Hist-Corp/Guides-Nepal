import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { getSupabase } from '../../utils/supabase';
import { getApiUrl } from '../../config/api';

type Status = 'verifying' | 'ready' | 'submitting' | 'success' | 'error' | 'invalid';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const verifySession = async () => {
      try {
        const client = getSupabase();
        const { data, error } = await client.auth.getSession();
        if (!mounted) return;
        if (error) {
          setStatus('invalid');
          return;
        }
        setStatus(data.session ? 'ready' : 'invalid');
      } catch {
        if (mounted) setStatus('invalid');
      }
    };
    verifySession();
    return () => {
      mounted = false;
    };
  }, []);

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Must contain an uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError('Must contain a number');
      return false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(value)) {
      setPasswordError('Must contain a special character');
      return false;
    }
    setPasswordError(null);
    return true;
  };
  const validateConfirm = (value: string) => {
    if (!value) {
      setConfirmError('Please confirm your password');
      return false;
    }
    if (value !== password) {
      setConfirmError('Passwords do not match');
      return false;
    }
    setConfirmError(null);
    return true;
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) validatePassword(e.target.value);
    if (confirmError) validateConfirm(confirmPassword);
  };
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmError) validateConfirm(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password) || !validateConfirm(confirmPassword)) return;
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const client = getSupabase();
      const { error } = await client.auth.updateUser({ password });
      if (error) {
        setStatus('error');
        setErrorMessage(error.message || 'Could not update password.');
        return;
      }
      try {
        const { data: sessionData } = await client.auth.getSession();
        const token = sessionData.session?.access_token;
        await fetch(getApiUrl('/auth/sync-password'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabase_access_token: token, password }),
        });
      } catch (syncErr) {
        console.warn('Backend sync failed:', syncErr);
      }
      await client.auth.signOut();
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('An unexpected error occurred.');
    }
  };
  return (
    <main className="min-h-screen bg-[#FFF0E6] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#FFF0E6] p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-[#213448] shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#213448] mb-1">Set a new password</h2>
          <p className="text-gray-600">Choose a strong password for your account</p>
        </div>
        <div className="p-8">
          {status === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#213448] mb-3" />
              <p className="text-gray-600 text-sm">Verifying your reset link...</p>
            </div>
          )}
          {status === 'invalid' && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">This link is no longer valid</h3>
              <p className="text-gray-600 text-sm mb-6">
                The password reset link may have expired or already been used.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Back to home
              </button>
            </div>
          )}
          {status === 'success' && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Password updated</h3>
              <p className="text-gray-600 text-sm mb-6">
                Your password has been changed successfully.
              </p>
              <Link
                to="/"
                className="block w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Back to home
              </Link>
            </div>
          )}
          {(status === 'ready' || status === 'submitting' || status === 'error') && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  required
                  autoFocus
                  className={
                    'w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 pr-12 bg-gray-50 focus:bg-white ' +
                    (passwordError ? 'border-red-500' : 'border-gray-200')
                  }
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={status === 'submitting'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#213448]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {passwordError && <div className="text-red-600 text-xs mt-1">{passwordError}</div>}
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  required
                  className={
                    'w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 pr-12 bg-gray-50 focus:bg-white ' +
                    (confirmError ? 'border-red-500' : 'border-gray-200')
                  }
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  disabled={status === 'submitting'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#213448]"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {confirmError && <div className="text-red-600 text-xs mt-1">{confirmError}</div>}
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                Password must be at least 8 characters and include an uppercase letter, a number,
                and a special character.
              </div>
              {status === 'error' && errorMessage && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
