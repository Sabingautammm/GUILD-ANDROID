import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const GOOGLE_WEB_CLIENT_ID =
  (Constants.expoConfig?.extra as any)?.googleSignIn?.webClientId || '';

const TOKEN_KEY = 'guild_google_id_token';

export async function initGoogleSignIn(): Promise<void> {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) {
    throw new Error('No ID token returned from Google. Try again.');
  }
  await SecureStore.setItemAsync(TOKEN_KEY, idToken);
  return idToken;
}

export async function getCachedGoogleIdToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore
  }
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}
