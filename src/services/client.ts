import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://guild-backend-ow9l.onrender.com/api';

const TOKEN_KEY = 'guild_access_token';
const COOKIE_KEY = 'guild_session_cookies';

let inMemoryToken: string | null = null;
let inMemoryCookies: string | null = null;

export async function getStoredToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken;
  try {
    inMemoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    // fallback
  }
  return inMemoryToken;
}

export async function setStoredToken(token: string | null): Promise<void> {
  inMemoryToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // fallback
  }
}

export async function getStoredCookies(): Promise<string | null> {
  if (inMemoryCookies) return inMemoryCookies;
  try {
    inMemoryCookies = await SecureStore.getItemAsync(COOKIE_KEY);
  } catch {
    // fallback
  }
  return inMemoryCookies;
}

export async function setStoredCookies(cookies: string | null): Promise<void> {
  inMemoryCookies = cookies;
  try {
    if (cookies) {
      await SecureStore.setItemAsync(COOKIE_KEY, cookies);
    } else {
      await SecureStore.deleteItemAsync(COOKIE_KEY);
    }
  } catch {
    // fallback
  }
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 0, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  timeoutMs?: number;
  body?: any;
}

export async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 15000, headers, body, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = await getStoredToken();
  const cookies = await getStoredCookies();

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const reqHeaders: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(cookies && { Cookie: cookies }),
    ...(headers as Record<string, string>),
  };

  const reqBody = isFormData
    ? body
    : body !== undefined
      ? JSON.stringify(body)
      : undefined;

  let response: Response;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  try {
    response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
      body: reqBody,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.', 0);
    }
    throw new ApiError('Cannot connect to GUILD server. Please try again.', 0);
  }

  clearTimeout(timeoutId);

  // Capture Set-Cookie headers if any (for mobile cookie emulation)
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    await setStoredCookies(setCookie);
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const msg = data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(msg, response.status, data?.errors);
  }

  return data as T;
}
