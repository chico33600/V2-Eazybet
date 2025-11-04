'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderCoins } from '@/components/header-coins';
import { BottomNav } from '@/components/bottom-nav';
import { FloatingButton } from '@/components/floating-button';
import { TapToEarnModal } from '@/components/tap-to-earn-modal';
import { useNavigationStore, useBetSlipUIStore, useBetStore } from '@/lib/store';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { activeHomeTab } = useNavigationStore();
  const { isExpanded } = useBetSlipUIStore();
  const { selections } = useBetStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldShowFloatingButton = 
    mounted &&
    pathname === '/' && 
    activeHomeTab === 'upcoming' && 
    !isExpanded &&
    selections.length === 0;

  return (
    <>
      <HeaderCoins onCoinsClick={() => setModalOpen(true)} />
      <div className="min-h-screen pt-20 pb-24">
        {children}
      </div>
      {shouldShowFloatingButton && (
        <FloatingButton onClick={() => setModalOpen(true)} />
      )}
      <BottomNav />
      <TapToEarnModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
