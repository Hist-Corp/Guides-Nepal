import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getApiUrl } from '../../config/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'traveler' | 'guide' | 'host'>('traveler');
  const { login, setTokens, setRememberMe } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) validateEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) validatePassword(e.target.value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setRememberMe(remember);
        login({
          firstName: data.user.firstName || (userType === 'traveler' ? 'John' : 'Guide'),
          lastName: data.user.lastName || (userType === 'traveler' ? 'Doe' : 'Host'),
          email: data.user.email || email,
          role: data.user.role,
        });
        setTokens(data.access_token, data.refresh_token);
        onClose();
        // Guides land on their dashboard (or onboarding if not yet complete).
        if (data.user?.role === 'guide') {
          navigate('/guide/dashboard');
        }
        // Approved hosts land on the Host Frontend. Their account only
        // exists once a regional head/admin approved the application, so a
        // successful login here means they are already active.
        if (data.user?.role === 'host') {
          navigate('/host/dashboard');
        }
      } else {
        try {
          const errData = await resp.json();
          setError(errData.detail || 'Login failed');
        } catch {
          setError('Login failed');
        }
      }
    } catch {
      setError(
        'Cannot reach the server. Make sure the backend is running (npm run dev in /backend or uvicorn on :8000).'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative m-auto w-full max-w-[560px] bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-[#FFF0E6] px-6 py-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2 shrink-0" aria-label="Guides Nepal - Home">
              <img
                src="/images/logo.png"
                alt="Guides Nepal logo"
                className="object-contain shrink-0"
                style={{ maxWidth: '200px', maxHeight: '50px' }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#213448] mb-1">Welcome back</h2>
          <p className="text-gray-600">Log in to your account</p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setUserType('traveler')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                userType === 'traveler'
                  ? 'bg-brand-yellow text-[#213448] shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Traveler
            </button>
            <button
              onClick={() => setUserType('guide')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                userType === 'guide'
                  ? 'bg-brand-yellow text-[#213448] shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Guide
            </button>
            <button
              onClick={() => setUserType('host')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                userType === 'host'
                  ? 'bg-brand-yellow text-[#213448] shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Host
            </button>
          </div>

          {userType === 'traveler' && (
            <div className="text-center mb-4">
              <span className="text-gray-500 text-sm">Log in with your email address</span>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white ${emailError ? 'border-red-500' : 'border-gray-200'}`}
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <div className="text-red-600 text-xs mt-1">{emailError}</div>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 pr-12 bg-gray-50 focus:bg-white ${passwordError ? 'border-red-500' : 'border-gray-200'}`}
                value={password}
                onChange={handlePasswordChange}
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

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            {userType === 'traveler' && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="text-[#213448] font-bold text-sm hover:text-brand-yellow transition-colors hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-yellow hover:bg-[#ffba0a] text-[#213448] font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
              disabled={loading}
            >
              Log in
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            {userType === 'host' ? (
              <>
                No account?{' '}
                <button
                  onClick={() => navigate('/host-application')}
                  className="text-[#213448] font-bold hover:text-brand-yellow hover:underline transition-colors"
                >
                  Become a Host
                </button>
              </>
            ) : (
              <>
                No account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-[#213448] font-bold hover:text-brand-yellow hover:underline transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
