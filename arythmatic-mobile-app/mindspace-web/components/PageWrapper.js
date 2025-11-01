'use client';
import HeaderBar from '../components/HeaderBar';
import ConsentModal from '../components/ConsentModal';
import { useLumi } from '../contexts/LumiContext';

export default function PageWrapper({ children }){
  const { consentAsked, grant, decline } = useLumi();
  return (
    <>
      <HeaderBar />
      <ConsentModal open={!consentAsked} onAllow={grant} onDecline={decline} />
      {children}
    </>
  );
}
