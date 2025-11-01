'use client';
export default function BottomNav() {
  const tabs = [
    { href: '/', label: 'Home' },
    { href: '/mindspace', label: 'MindSpace' },
    { href: '/chat', label: 'Chat' },
    { href: '/insights', label: 'Insights' },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-panel/90 backdrop-blur border-t border-border">
      <div className="mx-auto max-w-md flex justify-around py-2">
        {tabs.map(t => (
          <a key={t.href} href={t.href} className="px-3 py-1 text-sm text-sub hover:text-white">{t.label}</a>
        ))}
      </div>
    </nav>
  );
}
