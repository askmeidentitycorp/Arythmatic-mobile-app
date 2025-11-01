import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    // fetch recent insights
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/insights`, { cache: 'no-store' });
    const data = res.ok ? await res.json() : { entries: [], daily: [] };
    const entries = data.entries || [];
    const top = entries.sort((a,b)=> b.n - a.n).slice(0,3).map(e=> e.label).join(', ');
    let text = `Your week shows ${top || 'steady emotions'}. Consider short grounding midweek and celebrate small wins.`;
    if (hasOpenAI) {
      const user = JSON.stringify({ entries: data.entries, daily: data.daily });
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Write a short, kind weekly reflection (2 sentences) from mood data. No medical advice.' },
            { role: 'user', content: user }
          ],
          temperature: 0.7, max_tokens: 120
        })
      });
      if (r.ok) { const j = await r.json(); text = j.choices?.[0]?.message?.content?.trim() || text; }
    }
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ text: 'Gentle note: begin with a slow breath. Your light is growing.' });
  }
}
