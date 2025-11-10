// utils/dateRanges.js
// Small helper to standardize period -> start/end date mapping across screens

/**
 * Return start and end ISO dates for a given range label.
 * Supported: 'This Week' | 'This Month' | 'This Quarter' | 'This Year'
 * Fallback: nulls meaning no restriction.
 */
export function getPeriodRange(range) {
  if (!range) return { start: null, end: null };
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfWeek = () => {
    const d = new Date(end);
    const day = d.getDay(); // 0=Sun
    const diff = (day === 0 ? 6 : day - 1); // make Monday the first day
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const startOfMonth = () => new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
  const startOfQuarter = () => {
    const q = Math.floor(end.getMonth() / 3);
    return new Date(end.getFullYear(), q * 3, 1, 0, 0, 0, 0);
  };
  const startOfYear = () => new Date(end.getFullYear(), 0, 1, 0, 0, 0, 0);

  let start = null;
  switch (range) {
    case 'This Week':
      start = startOfWeek();
      break;
    case 'This Month':
      start = startOfMonth();
      break;
    case 'This Quarter':
      start = startOfQuarter();
      break;
    case 'This Year':
      start = startOfYear();
      break;
    default:
      return { start: null, end: null };
  }

  return { start: toISODate(start), end: toISODate(end) };
}

/** Convert Date -> 'YYYY-MM-DD' */
export function toISODate(d) {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Map period label to API query params (DRF-friendly) */
export function periodParams(range) {
  const { start, end } = getPeriodRange(range);
  if (!start || !end) return {};
  // Common DRF patterns. We include multiple keys to maximize compatibility.
  return {
    created_at__date_gte: start,
    created_at__date_lte: end,
    created_at__gte: `${start}T00:00:00Z`,
    created_at__lte: `${end}T23:59:59Z`,
  };
}