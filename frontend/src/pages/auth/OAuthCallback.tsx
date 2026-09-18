import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login, setTokens, setRememberMe } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access_token');
    const refresh = params.get('refresh_token');
    const email = params.get('email');
    if (access && refresh && email) {
      setRememberMe(true);
      login({
        firstName: 'Social',
        lastName: 'User',
        email,
      });
      setTokens(access, refresh);
      navigate('/', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, login, setTokens, setRememberMe]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Finishing sign-in…</div>
    </main>
  );
}
