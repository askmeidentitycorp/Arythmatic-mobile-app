import HeaderBar from '../components/HeaderBar';
import CheckIn from '../components/CheckIn';

export default function HomePage(){
  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <HeaderBar />
      <div className="text-2xl font-semibold mb-2">LUMI</div>
      <div className="text-sub mb-4">MindSpace — Regulate • Reflect • Reconnect • Reward</div>

      <div className="grid gap-3">
        <a href="/mindspace" className="card p-4 hover:bg-[#121c31]">
          <div className="font-semibold">🫧 Calm Play</div>
          <div className="text-sub text-sm">Sensorimotor grounding mini‑games</div>
        </a>
        <a href="/mindspace#nourish" className="card p-4 hover:bg-[#121c31]">
          <div className="font-semibold">📖 Nourish Mind</div>
          <div className="text-sub text-sm">Reading corner, audio wisdom, reflections</div>
        </a>
        <a href="/mindspace#reconnect" className="card p-4 hover:bg-[#121c31]">
          <div className="font-semibold">🌸 Reconnect Self</div>
          <div className="text-sub text-sm">Guided micro‑practices to reset</div>
        </a>
        <div className="card p-4">
          <div className="text-sm text-sub mb-2">Quick Check‑In</div>
          <CheckIn />
        </div>
      </div>

      <div className="mt-6 text-xs text-sub">
        Installable PWA: use your browser’s “Add to Home Screen” to download.
      </div>
    </div>
  );
}
