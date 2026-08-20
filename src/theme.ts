export const theme = {
  colors: {
    bg: '#0c0a07',
    bgElevated: '#1a1612',
    surface: '#27221c',
    surfaceAlt: '#332b24',
    border: '#3f352c',
    borderHover: '#5c5044',
    primary: '#7c3aed',
    primaryMuted: '#a78bfa',
    accent: '#f43f5e',
    gold: '#e3a012',
    goldBright: '#f5c042',
    text: '#e2e8f0',
    textMuted: '#a8a29e',
    textDim: '#78716c',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    overlay: 'rgba(12, 10, 7, 0.85)',
  },
  fonts: {
    display: undefined as string | undefined,
    body: undefined as string | undefined,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
} as const;

export type Theme = typeof theme;
