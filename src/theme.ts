import { useColorScheme } from 'react-native';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  success: string;
  dieBg: string;
  dieBorder: string;
  heldDieBg: string;
  heldDieBorder: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;
  resetBg: string;
  resetText: string;
  rollButtonBg: string;
  rollButtonText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  modalBackdrop: string;
};

export const SCREEN_SCROLL_TOP_GAP = 28;
export const SCREEN_SCROLL_BOTTOM_GAP = 16;

const lightColors: ThemeColors = {
  background: '#f3f4f6',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  border: '#d1d5db',
  accent: '#0b57d0',
  accentText: '#0b57d0',
  success: '#166534',
  dieBg: '#eff6ff',
  dieBorder: '#bfdbfe',
  heldDieBg: '#dcfce7',
  heldDieBorder: '#22c55e',
  buttonPrimaryBg: '#0b57d0',
  buttonPrimaryText: '#ffffff',
  buttonSecondaryBg: '#ffffff',
  buttonSecondaryText: '#111827',
  buttonSecondaryBorder: '#111827',
  resetBg: '#111827',
  resetText: '#ffffff',
  rollButtonBg: '#e5e7eb',
  rollButtonText: '#111827',
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  inputText: '#111827',
  modalBackdrop: 'rgba(15, 23, 42, 0.35)',
};

const darkColors: ThemeColors = {
  background: '#111827',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  border: '#374151',
  accent: '#60a5fa',
  accentText: '#60a5fa',
  success: '#4ade80',
  dieBg: '#1e3a5f',
  dieBorder: '#3b82f6',
  heldDieBg: '#14532d',
  heldDieBorder: '#22c55e',
  buttonPrimaryBg: '#2563eb',
  buttonPrimaryText: '#ffffff',
  buttonSecondaryBg: '#1f2937',
  buttonSecondaryText: '#f9fafb',
  buttonSecondaryBorder: '#f9fafb',
  resetBg: '#f9fafb',
  resetText: '#111827',
  rollButtonBg: '#374151',
  rollButtonText: '#f9fafb',
  inputBg: '#1f2937',
  inputBorder: '#4b5563',
  inputText: '#f9fafb',
  modalBackdrop: 'rgba(0, 0, 0, 0.6)',
};

export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export function useStatusBarStyle(): 'light' | 'dark' {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? 'light' : 'dark';
}
