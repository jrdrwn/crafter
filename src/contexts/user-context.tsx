'use client';

import { deleteCookie, getCookie } from 'cookies-next/client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type UserContextValue = {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: UserProfile | null) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie('token')?.toString();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await fetch('/api/user/profile', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data as UserProfile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    getProfile();
  }, [getProfile]);

  const refresh = useCallback(async () => {
    await getProfile();
  }, [getProfile]);

  const logout = useCallback(async () => {
    try {
      // If a logout API exists, call it to invalidate server-side state
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      deleteCookie('token');
      setUser(null);
      location.reload();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within <UserProvider>');
  return ctx;
}
