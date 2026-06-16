import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '../hooks/useAuth';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state: any) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { access_token, user } = response.data.data;
      
      login(user, access_token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login: handleLogin, loading, error };
}

export function useLogout() {
  const logout = useAuthStore((state: any) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return handleLogout;
}
