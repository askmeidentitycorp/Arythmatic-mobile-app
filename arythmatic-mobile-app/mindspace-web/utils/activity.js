// utils/activity.js
export function markActivity() {
  if (typeof window === 'undefined') return;
  try {
    const key = 'ms_activity_days';
    const today = new Date().toISOString().slice(0,10);
    const set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    set.add(today);
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {}
}

export function getStreak() {
  if (typeof window === 'undefined') return 0;
  try {
    const key = 'ms_activity_days';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const set = new Set(arr);
    let streak = 0;
    let d = new Date();
    for (;;) {
      const day = d.toISOString().slice(0,10);
      if (set.has(day)) { streak += 1; d.setDate(d.getDate()-1); } else break;
    }
    return streak;
  } catch { return 0; }
}
