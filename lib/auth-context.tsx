'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } from '@/lib/api/api';

export type UserRole = 'user' | 'seller' | 'admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  initialized: boolean
  refreshAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // RTK Query mutations and queries
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const { data: meData, isLoading: meLoading, isError: meError, refetch } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  // 🟢 Run after hydration (prevents false 401 on Vercel)
  useEffect(() => {
    if (!meLoading) {
      if (meData) {
        setUser(meData);
      } else {
        setUser(null);
      }
      setInitialized(true);
      setLoading(false);
    }
  }, [meData, meLoading]);

  const refreshAuthStatus = async (): Promise<void> => {
    await refetch();
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const result = await loginMutation({ email, password }).unwrap();
      
      // Update user state with the returned user data
      setUser(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const result = await registerMutation({ name, email, password }).unwrap();
      
      // Update user state with the returned user data
      setUser(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation({}).unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
        initialized,
        refreshAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}