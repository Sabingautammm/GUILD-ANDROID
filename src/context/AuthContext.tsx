import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, OnboardingInfo, User, getCurrentUser, logout as logoutApi, googleLoginWithToken } from '../services/auth';
import { clearStoredAuth } from '../services/storage';

interface AuthState {
  user: User | null;
  onboarding: OnboardingInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
}

interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    onboarding: null,
    isAuthenticated: false,
    isLoading: true,
    needsOnboarding: false,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      setState({
        user: res.user,
        onboarding: res.onboarding,
        isAuthenticated: true,
        isLoading: false,
        needsOnboarding: res.onboarding?.needsOnboarding ?? false,
      });
    } catch {
      setState({
        user: null,
        onboarding: null,
        isAuthenticated: false,
        isLoading: false,
        needsOnboarding: false,
      });
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await googleLoginWithToken(idToken);
    setState({
      user: res.user,
      onboarding: res.onboarding,
      isAuthenticated: true,
      isLoading: false,
      needsOnboarding: res.onboarding?.needsOnboarding ?? false,
    });
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    await clearStoredAuth();
    setState({
      user: null,
      onboarding: null,
      isAuthenticated: false,
      isLoading: false,
      needsOnboarding: false,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, refresh, loginWithGoogle, logout }),
    [state, refresh, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
