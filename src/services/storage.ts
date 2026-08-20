import { setStoredCookies, setStoredToken } from './client';
import { signOutGoogle } from './googleAuth';

export async function clearStoredAuth(): Promise<void> {
  await Promise.all([
    setStoredToken(null),
    setStoredCookies(null),
    signOutGoogle(),
  ]);
}
