'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  // 🟢 Run after hydration (prevents false 401 on Vercel)
  useEffect(() => {
    const timer = setTimeout(() => {
      void checkAuthStatus()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const refreshAuthStatus = async (): Promise<void> => {
    await checkAuthStatus()
  }

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const response: Response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const userData: AuthUser = await response.json()
        setUser(userData)
      } else if (response.status === 401) {
        setUser(null)
      }
    } catch {
      console.info('Auth check skipped (network/cold start)')
    } finally {
      setInitialized(true)
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      const response: Response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        }
      )

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const userData: AuthUser = await response.json()
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      const response: Response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        }
      )

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const userData: AuthUser = await response.json()
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
    }
  }

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
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
