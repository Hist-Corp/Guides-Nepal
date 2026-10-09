import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, Facebook } from 'lucide-react';
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
  const [userType, setUserType] = useState<'traveler' | 'guide'>('traveler');
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

  const handleSocial = (provider: 'google' | 'facebook' | 'apple') => {
    const dev = import.meta.env.VITE_DEV_FAKE_LOGIN === '1';
    if (dev) {
      setRememberMe(true);
      const emailStub =
        provider === 'google'
          ? 'google.user@example.com'
          : provider === 'facebook'
            ? 'facebook.user@example.com'
            : 'apple.user@example.com';
      login({
        firstName: 'Social',
        lastName: 'User',
        email: emailStub,
      });
      setTokens('dev-social-token', 'dev-social-refresh');
      onClose();
      return;
    }
    const urls: Record<string, string | undefined> = {
      google: import.meta.env.VITE_GOOGLE_OAUTH_URL || getApiUrl('/auth/oauth/google/start'),
      facebook: import.meta.env.VITE_FACEBOOK_OAUTH_URL || getApiUrl('/auth/oauth/facebook/start'),
      apple: import.meta.env.VITE_APPLE_OAUTH_URL,
    };
    const url = urls[provider];
    if (url) {
      window.location.href = url;
    } else {
      setError('Social login not configured');
    }
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
            <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-[#213448] shadow-sm transform -rotate-12">
              <span className="font-bold text-xl">:)</span>
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
          </div>

          <div className="flex gap-3 mb-6 justify-center">
            <button
              onClick={() => handleSocial('apple')}
              className="flex-1 bg-black text-white h-11 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.23 3.91-1.12 1.5.09 2.3.63 3.15 1.89-6.68 2.68-1.55 8.48 1.55 9.74-.96 1.75-2.2 2.87-3.69 1.72zM12.93 5.4c.75-1.42 2.5-1.93 2.5-1.93s-.3 2.11-1.55 3.59c-.8 1-2.3 1.56-2.3 1.56s-.26-1.9 1.35-3.22z" />
              </svg>
            </button>

            <button
              onClick={() => handleSocial('facebook')}
              className="flex-1 bg-[#1877F2] text-white h-11 rounded-full flex items-center justify-center hover:bg-[#166fe5] transition-colors"
            >
              <Facebook className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => handleSocial('google')}
              className="flex-1 bg-white border border-gray-200 text-gray-800 h-11 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <span className="text-gray-500 text-sm">Log in with your email address</span>
          </div>

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

            <div className="flex justify-start">
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-[#213448] font-bold text-sm hover:text-brand-yellow transition-colors hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-yellow hover:bg-[#E5A800] text-[#213448] font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
              disabled={loading}
            >
              Log in
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            No account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-[#213448] font-bold hover:text-brand-yellow hover:underline transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
