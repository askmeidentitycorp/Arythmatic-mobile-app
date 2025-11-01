import BottomNav from '../components/BottomNav';
import './globals.css';
import { LumiProvider } from '../contexts/LumiContext';
import AmbientParticles from '../components/AmbientParticles';
import OnboardingOverlay from '../components/OnboardingOverlay';
import MoodTheme from '../components/MoodTheme';
import HelpFab from '../components/HelpFab';

export const metadata = {
  title: 'LUMI',
  description: 'LUMI — Permission-based emotion intelligence with MindSpace: Calm Play, Nourish Mind, Reconnect Self',
  themeColor: '#0B1422',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1422" />
      </head>
      <body className="min-h-screen grad-soft">
        <LumiProvider>
          <MoodTheme />
          <AmbientParticles />
          <OnboardingOverlay />
          <main className="pb-16">
            {children}
          </main>
          <BottomNav />
          <HelpFab />
        </LumiProvider>
        <script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js');});}`}} />
      </body>
    </html>
  );
}
