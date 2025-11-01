export default function ShareLightPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  let data = null;
  try { data = params ? JSON.parse(decodeURIComponent(escape(atob(params.get('d')||'')))) : null; } catch {}
  const entries = (data && data.entries) || [];
  const daily = (data && data.daily) || [];
  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-center mb-3">
        <div className="text-xl font-semibold">My Light Journey</div>
        <div className="text-sub text-sm">Positivity visuals only — no private text</div>
      </div>
      <div className="card p-4">
        <div className="font-semibold mb-2">Mood Summary</div>
        <div className="grid gap-1">
          {entries.map(({label, n}) => (
            <div key={label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
              <div className="text-sm capitalize">{label}</div>
              <div className="h-2 bg-[#e5e7eb] rounded">
                <div className="h-2 rounded bg-[#6B5CE7]" style={{ width: Math.min(100, n*10)+'%' }} />
              </div>
              <div className="text-sm text-right">{n}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-1">Timeline</div>
          <Timeline daily={daily} />
        </div>
      </div>
    </div>
  );
}

function Timeline({ daily }){
  if (!daily || daily.length===0) return <div className="text-sm text-sub">No timeline data.</div>;
  const w = 300, h = 100, pad = 10;
  const xs = daily.map((_, i) => i);
  const ys = daily.map(d => Math.max(-1, Math.min(1, d.value||0)));
  const xMax = Math.max(1, xs[xs.length-1]);
  const points = ys.map((v,i)=>{
    const x = pad + (i/xMax)*(w - 2*pad);
    const y = pad + (1 - (v+1)/2)*(h - 2*pad);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="bg-white rounded border border-[#e5e7eb]">
      <polyline fill="none" stroke="#6B5CE7" strokeWidth="2" points={points} />
    </svg>
  );
}
