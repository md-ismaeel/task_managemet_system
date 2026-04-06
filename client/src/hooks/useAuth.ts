'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/auth';
import { tokenStorage } from '@/lib/api';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = tokenStorage.getUser();
    if (stored && tokenStorage.getAccess()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);
      tokenStorage.setAccess(data.accessToken);
      tokenStorage.setUser(data.user);
      setUser(data.user);
      router.push('/dashboard');
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await authApi.register(name, email, password);
      tokenStorage.setAccess(data.accessToken);
      tokenStorage.setUser(data.user);
      setUser(data.user);
      router.push('/dashboard');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    } finally {
      tokenStorage.clear();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  }, [router]);

  return { user, loading, login, register, logout };
};
