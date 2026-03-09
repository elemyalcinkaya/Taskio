// Taskio Color Palette
export const COLORS = {
  primary: '#6C3CE1',       // Ana mor renk
  primaryLight: '#8B5CF6',
  primaryDark: '#4F28A8',
  secondary: '#3B82F6',     // Mavi
  background: '#0F1221',    // Koyu arka plan
  surface: '#1A1F3A',       // Kart arka planı
  surfaceLight: '#252B4A',
  white: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D3561',
  success: '#10B981',       // Done - yeşil
  warning: '#F59E0B',       // Review - turuncu
  info: '#3B82F6',          // In Progress - mavi
  danger: '#EF4444',        // Urgent - kırmızı
  todo: '#9CA3AF',          // To Do - gri
  inProgress: '#3B82F6',    // In Progress - mavi
  review: '#F59E0B',        // Review - turuncu
  done: '#10B981',          // Done - yeşil
  cardBg: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.3)',
};

export const STATUS_COLORS = {
  'To Do': COLORS.todo,
  'In Progress': COLORS.inProgress,
  'Review': COLORS.warning,
  'Done': COLORS.success,
};

export const PRIORITY_COLORS = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  URGENT: '#DC2626',
};
