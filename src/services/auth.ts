import { apiFetch } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  inGameName?: string;
  game?: string;
  gameUid?: string;
  region?: string;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
}

export interface OnboardingInfo {
  needsOnboarding: boolean;
  hasActiveGuild: boolean;
  hasPendingApplication: boolean;
  role: string;
  guildUid: string | null;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  onboarding: OnboardingInfo;
}

export function googleLoginWithToken(idToken: string) {
  return apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}

export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export function getCurrentUser() {
  return apiFetch<AuthResponse>('/auth/me', { method: 'GET' });
}

export function submitUidRegion(uid: string, region: string) {
  return apiFetch('/auth/onboarding/uid-region', {
    method: 'POST',
    body: { uid, region },
  });
}

export function completeOnboarding(ffData: any) {
  return apiFetch('/auth/onboarding/complete', {
    method: 'POST',
    body: ffData,
  });
}
