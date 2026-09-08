import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../services/api';
import { normalizeRole } from '../utils/roles';
import { useAuthStore } from '../state/authStore';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [selectRole, setSelectRole] = useState<
    'super-admin' | 'admin' | 'content-writer' | 'regional-head' | 'customer-support' | 'host' | 'guide'
  >('admin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { token, role, setToken, setRole, setUser, setError, setLoading, error } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && role) {
      navigate(`/dashboard/${role}`, { replace: true });
    }
  }, [token, role, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (import.meta.env.VITE_DEV_FAKE_LOGIN === '1') {
        const me = {
          id: 1,
          email: 'huhehaha.prakaz@gmail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: selectRole,
        };
        setToken('dev-token');
        setRole(selectRole);
        setUser(me);
        navigate(`/dashboard/${me.role}`, { replace: true });
        if (remember) {
          try {
            localStorage.setItem('gn_token', 'dev-token');
            localStorage.setItem('gn_role', me.role);
            localStorage.setItem('gn_user', JSON.stringify(me));
          } catch {}
        }
        return;
      }
      const res = await login({ email, password });
      setToken(res.access_token ?? null);
      const me = res.user;
      const normalized = normalizeRole(me.role);
      if (!normalized) {
        setError('Your account does not have dashboard access');
        return;
      }
      setRole(normalized);
      setUser({ ...me, role: normalized });
      navigate(`/dashboard/${normalized}`, { replace: true });
      if (remember) {
        try {
          localStorage.setItem('gn_token', res.access_token ?? '');
          localStorage.setItem('gn_role', normalized);
          localStorage.setItem('gn_user', JSON.stringify({ ...me, role: normalized }));
        } catch {}
      }
    } catch (err: any) {
      // Show the actual error from the API when available
      const detail = err?.response?.data?.detail;
      setError(detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-peach">
      <form onSubmit={onSubmit} className="w-96 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="text-xl font-semibold text-darkBlue">Dashboard Login</div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Role</label>
          <select
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            value={selectRole}
            onChange={(e) => setSelectRole(e.target.value as any)}
          >
            <option value="super-admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="content-writer">Content Writer</option>
            <option value="regional-head">Regional Head</option>
            <option value="customer-support">Customer Support</option>
            <option value="host">Host</option>
            <option value="guide">Guide</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Password</label>
          <div className="relative">
            <input
              className="w-full rounded-lg border px-3 py-2 pr-11 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#213448]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>
        <div className="text-center text-sm text-gray-600">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-[#213448] font-semibold hover:text-brand-yellow transition-colors hover:underline"
          >
            Forgot your password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-yellow text-darkBlue font-semibold py-2 hover:opacity-90"
        >
          Login
        </button>
      </form>
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSwitchToLogin={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
