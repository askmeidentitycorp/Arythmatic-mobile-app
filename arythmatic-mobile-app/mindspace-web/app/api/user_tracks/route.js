import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabaseServer';

export async function POST(req) {
  try {
    const { track_id } = await req.json();
    if (!track_id) return NextResponse.json({ error: 'track_id required' }, { status: 400 });
    const supabase = createServerSupabase();
    if (!supabase) return NextResponse.json({ ok: true });
    const device = (typeof crypto!=='undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'anon';
    const { error } = await supabase.from('user_tracks').insert({ user_id: device, track_id, favourite: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message||e) }, { status: 500 });
  }
}
