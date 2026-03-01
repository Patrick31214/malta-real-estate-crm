import { Anchor, Car, Activity, Compass, Settings2 } from 'lucide-react';

// ─── colour tokens ───────────────────────────────────────────────
export const E_DARK = '#2D6A4F';
export const E_MID  = '#40916C';
export const GOLD   = '#D4AF37';
export const GOLD2  = '#B8962E';

export const STATUS_COLORS = {
  available:   '#40916C',
  under_offer: '#D4AF37',
  sold:        '#c0392b',
  rented:      '#2980b9',
  draft:       '#666',
  withdrawn:   '#888',
};

export const TOOLTIP_STYLE = {
  background: 'rgba(10,20,15,0.95)',
  border: `1px solid rgba(45,106,79,0.35)`,
  borderRadius: 8,
  color: '#e8f5e9',
  fontSize: 12,
};

// ─── priority config ─────────────────────────────────────────────
export const PRIORITY_CONFIG = {
  low:    { color: '#888888', bg: 'rgba(136,136,136,0.15)', label: 'Low',    pulse: false },
  normal: { color: '#2980b9', bg: 'rgba(41,128,185,0.15)',  label: 'Normal', pulse: false },
  high:   { color: '#e67e22', bg: 'rgba(230,126,34,0.15)',  label: 'High',   pulse: false },
  urgent: { color: '#c0392b', bg: 'rgba(192,57,43,0.15)',   label: 'Urgent', pulse: true  },
};

// ─── misc constants ──────────────────────────────────────────────
export const RENTAL_TYPE_SHORT       = 'short';
export const MAX_ANN_TITLE_LEN       = 60;
export const OPEN_INQUIRY_STATUSES   = ['new', 'assigned', 'in_progress', 'viewing_scheduled', 'matched', 'on_hold'];

export const SERVICE_CATEGORY_CONFIG = {
  boat_tour:   { icon: Anchor,    label: 'Boat Tours'   },
  car_rental:  { icon: Car,       label: 'Car Rentals'  },
  bike_rental: { icon: Activity,  label: 'Bike Rentals' },
  guided_tour: { icon: Compass,   label: 'Guided Tours' },
  other:       { icon: Settings2, label: 'Other'        },
};

// ─── helper functions ────────────────────────────────────────────
export function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo && d <= now;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function fmtEur(val) {
  const n = Math.round(parseFloat(val) || 0);
  return '€' + n.toLocaleString('en-GB');
}

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
}
