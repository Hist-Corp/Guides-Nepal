import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User, Map, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [showPassword, setShowPassword] = useState(false);
  const { login, setTokens } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(password)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
    if (emailError) validateEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
    if (passwordError) validatePassword(e.target.value);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      const base =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1');
      const resp = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: 'traveler',
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        login({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          phone: formData.phone,
        });
        setTokens(data.access_token, data.refresh_token);
        onClose();
        // Reset state
        setTimeout(() => {
          setStep('role');
          setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
        }, 300);
      } else {
        try {
          const errData = await resp.json();
          setError(errData.detail || 'Registration failed. Please try again.');
        } catch {
          setError('Registration failed. Please try again.');
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

  const handleGuideSelect = () => {
    onClose();
    navigate('/become-guide');
  };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-y-auto p-4">
      {/* Backdrop (Blurred) */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative m-auto w-full max-w-[560px] bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Top Header Section (Peach) */}
        <div className="bg-[#FFF0E6] px-6 py-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2 shrink-0" aria-label="Guides Nepal - Home">
              <img
                src="/images/logo.png"
                alt="Guides Nepal logo"
                className=" object-contain shrink-0"
                style={{ maxWidth: '200px', maxHeight: '50px' }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {step === 'role' ? 'Join Guides-Nepal' : 'Create traveler account'}
          </h2>
          <p className="text-gray-500">
            {step === 'role'
              ? 'Choose how you want to use the platform'
              : 'Enter your details to get started'}
          </p>
        </div>

        {/* Body Section */}
        <div className="px-6 py-6 sm:px-8">
          {step === 'role' ? (
            <div className="space-y-4">
              {/* Traveler Option */}
              <button
                onClick={() => setStep('form')}
                className="w-full p-4 border-2 border-gray-100 hover:border-primary rounded-2xl flex items-center gap-4 transition-all hover:bg-primary/5 group text-left"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">I'm a Traveler</h3>
                  <p className="text-xs text-gray-500">I want to book tours and explore</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
              </button>

              {/* Guide Option — distinct Guide interface, never the Host app */}
              <button
                onClick={handleGuideSelect}
                className="w-full p-4 border-2 border-gray-100 hover:border-[#213448] rounded-2xl flex items-center gap-4 transition-all hover:bg-[#213448]/5 group text-left"
              >
                <div className="w-12 h-12 bg-secondary/10 text-[#213448] rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">I'm a Local Guide</h3>
                  <p className="text-xs text-gray-500">I want to lead tours and earn</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#213448] transition-colors" />
              </button>

              <div className="text-center mt-6 text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-primary font-bold hover:underline"
                >
                  Log in
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <span className="text-[#213448] font-bold text-sm">
                  Sign up with your email address
                </span>
              </div>

              {/* Form */}
              <form className="space-y-3" onSubmit={handleSignup}>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white ${emailError ? 'border-red-500' : 'border-gray-200'}`}
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                  {emailError && <div className="text-red-600 text-xs mt-1">{emailError}</div>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50 focus:bg-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900 pr-12 bg-gray-50 focus:bg-white ${passwordError ? 'border-red-500' : 'border-gray-200'}`}
                    value={formData.password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#213448]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {passwordError && (
                    <div className="text-red-600 text-xs mt-1">{passwordError}</div>
                  )}
                </div>

                {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                <label className="flex items-start gap-3 text-xs text-gray-500 px-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#213448] cursor-pointer"
                  />
                  <span>
                    When using Guides-Nepal you accept our{' '}
                    <a
                      href="#"
                      className="text-[#213448] font-bold hover:text-brand-yellow hover:underline transition-colors"
                    >
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="text-[#213448] font-bold hover:text-brand-yellow hover:underline transition-colors"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !acceptedTerms}
                  className="w-full bg-brand-yellow hover:bg-[#ffba0a] text-[#213448] font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing up…' : 'Sign up'}
                </button>
              </form>

              <div className="text-center mt-5 text-sm text-gray-500">
                <button
                  onClick={() => setStep('role')}
                  className="text-gray-400 hover:text-gray-600 mr-4"
                >
                  Back
                </button>
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-[#213448] font-bold hover:text-brand-yellow hover:underline transition-colors"
                >
                  Log in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
