import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabaseServer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { messageId, helpful, emotion } = body || {};
    const supabase = createServerSupabase();
    if (!supabase) return NextResponse.json({ ok: true, note: 'supabase not configured' });
    const { error } = await supabase.from('feedback').insert({ message_id: messageId || null, helpful: !!helpful, emotion: emotion || null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message||e) }, { status: 500 });
  }
}
