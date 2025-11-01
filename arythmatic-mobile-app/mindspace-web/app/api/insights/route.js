import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return NextResponse.json({ entries: [], daily: [] });
    const since = new Date(Date.now() - 7*24*3600*1000).toISOString();
    const { data, error } = await supabase
      .from('mood_events')
      .select('label, inserted_at')
      .gte('inserted_at', since);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const counts = {};
    const weights = { joy: 1, surprise: 0.2, neutral: 0, sadness: -1, anger: -1, fear: -1, disgust: -1 };
    const daily = {};
    for (const row of data) {
      const label = (row.label||'neutral').toLowerCase();
      counts[label] = (counts[label]||0)+1;
      const day = (row.inserted_at||'').slice(0,10);
      if (!daily[day]) daily[day] = { sum: 0, n: 0 };
      daily[day].sum += (weights[label] ?? 0);
      daily[day].n += 1;
    }
    const entries = Object.entries(counts).map(([label, n])=>({ label, n }));
    const dailyArr = Object.entries(daily)
      .map(([day, v]) => ({ day, value: v.n ? v.sum / v.n : 0 }))
      .sort((a,b)=> a.day.localeCompare(b.day));
    return NextResponse.json({ entries, daily: dailyArr });
  } catch (e) {
    return NextResponse.json({ error: String(e.message||e) }, { status: 500 });
  }
}
