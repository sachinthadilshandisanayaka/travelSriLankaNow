export type DateMode = 'NONE' | 'SINGLE' | 'RANGE' | 'MULTI';

export interface BkBlackoutDate {
  id?: number;
  navBookingConfigId: number;
  blackoutDate: string; // yyyy-MM-dd
  reason?: string;
}

export interface NavBookingConfig {
  id?: number;
  navConfigId: number;
  bookingTypeCode: string;

  // Date selection behaviour
  dateMode: DateMode;

  // Advance booking window
  minLeadDays: number;
  maxAdvanceDays: number | null;

  // Stay duration (RANGE mode)
  minStayDays: number | null;
  maxStayDays: number | null;

  // Party size
  minParty: number;
  maxParty: number | null;

  // Auth & policy
  requireAuth: boolean;

  // Day-of-week bitmask (bit 0 = Mon … bit 6 = Sun; null = all days)
  allowedDow: number | null;

  // Seasonal window
  bookingOpenFrom: string | null; // yyyy-MM-dd
  bookingOpenTo: string | null;   // yyyy-MM-dd

  // Forward-compat JSON
  extraConfig: string | null;

  isActive: boolean;
  blackoutDates?: BkBlackoutDate[];

  // Joined fields returned by the API
  navConfig?: { id: number; routePath: string; labelKey: string; labelOverride?: string };
  bookingType?: { code: string; name: string; entityType: string };
}

/** Blank object suitable for a "create" form */
export function blankNavBookingConfig(navConfigId = 0): NavBookingConfig {
  return {
    navConfigId,
    bookingTypeCode: '',
    dateMode: 'SINGLE',
    minLeadDays: 0,
    maxAdvanceDays: null,
    minStayDays: null,
    maxStayDays: null,
    minParty: 1,
    maxParty: null,
    requireAuth: false,
    allowedDow: null,
    bookingOpenFrom: null,
    bookingOpenTo: null,
    extraConfig: null,
    isActive: true,
  };
}

/** Day-of-week helper — bit position matches Java entity (Mon=0 … Sun=6) */
export const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function isDowAllowed(allowedDow: number | null, dayIndex: number): boolean {
  if (allowedDow == null) return true;
  return (allowedDow & (1 << dayIndex)) !== 0;
}

export function toggleDow(current: number | null, dayIndex: number): number {
  const mask = current ?? 127; // 127 = all days
  return mask ^ (1 << dayIndex);
}
