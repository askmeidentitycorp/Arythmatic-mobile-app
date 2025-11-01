import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabaseServer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { label, score } = body || {};
    if (!label || typeof score !== 'number') return NextResponse.json({ error: 'label, score required' }, { status: 400 });
    const supabase = createServerSupabase();
    if (!supabase) return NextResponse.json({ ok: true, note: 'supabase not configured' });
    const { error } = await supabase.from('mood_events').insert({ label, score });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message||e) }, { status: 500 });
  }
}
