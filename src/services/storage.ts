import { setStoredCookies, setStoredRefreshToken, setStoredToken } from './client';
import { signOutGoogle } from './googleAuth';

export async function clearStoredAuth(): Promise<void> {
  await Promise.all([
    setStoredToken(null),
    setStoredRefreshToken(null),
    setStoredCookies(null),
    signOutGoogle(),
  ]);
}