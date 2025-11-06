'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Coins, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderCoinsProps {
  onCoinsClick?: () => void;
}

export function HeaderCoins({ onCoinsClick }: HeaderCoinsProps) {
  const [mounted, setMounted] = useState(false);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [floatingGain, setFloatingGain] = useState<number | null>(null);
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const coins = mounted && profile ? profile.tokens : 0;
  const diamonds = mounted && profile ? profile.diamonds : 0;

  useEffect(() => {
    if (mounted && profile && displayCoins === 0) {
      console.log('[HeaderCoins] Initial setup, setting displayCoins to:', profile.tokens);
      setDisplayCoins(profile.tokens);
    }
  }, [mounted, profile, displayCoins]);

  useEffect(() => {
    if (!mounted) return;

    const handleTokensEarned = (event: CustomEvent) => {
      const { amount } = event.detail;
      setFloatingGain(amount);

      setTimeout(() => {
        setFloatingGain(null);
      }, 1500);
    };

    window.addEventListener('tokens-earned', handleTokensEarned as EventListener);
    return () => window.removeEventListener('tokens-earned', handleTokensEarned as EventListener);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    console.log('[HeaderCoins] Coins changed:', { oldDisplay: displayCoins, newCoins: coins });

    if (displayCoins !== coins && coins > displayCoins) {
      console.log('[HeaderCoins] Animating increase from', displayCoins, 'to', coins);
      const diff = coins - displayCoins;
      const steps = Math.min(diff, 20);
      const increment = diff / steps;
      let current = displayCoins;

      const interval = setInterval(() => {
        current += increment;
        if (current >= coins) {
          setDisplayCoins(coins);
          clearInterval(interval);
        } else {
          setDisplayCoins(Math.round(current));
        }
      }, 30);

      return () => clearInterval(interval);
    } else if (displayCoins !== coins) {
      console.log('[HeaderCoins] Direct update from', displayCoins, 'to', coins);
      setDisplayCoins(coins);
    }
  }, [coins, displayCoins, mounted]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-3 header-blur border-b border-[#30363D]/30">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profil')}
            aria-label="Aller au profil"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C1322B] to-[#8B1F1A] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <span className="text-white font-bold text-lg">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </button>

          <h1 className="text-2xl font-black tracking-tight select-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span className="bg-gradient-to-r from-[#C1322B] to-[#E84545] bg-clip-text text-transparent">Eazy</span>
            <span className="text-white">bet</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCoinsClick}
            aria-label="Cliquer pour gagner des jetons"
            className="relative flex items-center gap-1.5 bg-[#1C2128]/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-[#30363D] hover:bg-[#1C2128] hover:border-[#F5C144]/30 transition-all active:scale-95"
          >
            <Coins size={16} className="text-[#F5C144]" />
            <motion.span
              key={displayCoins}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-xs"
            >
              {displayCoins.toFixed(0)}
            </motion.span>

            <AnimatePresence>
              {floatingGain && (
                <motion.div
                  initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -40, x: 5, scale: [0.5, 1.2, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute -top-2 right-0 pointer-events-none"
                >
                  <div className="text-green-400 font-black text-base drop-shadow-lg whitespace-nowrap"
                       style={{
                         textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 0 0 20px rgba(74, 222, 128, 0.4)'
                       }}>
                    +{floatingGain}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => router.push('/airdrop')}
            aria-label="Aller à l'airdrop"
            className="flex items-center gap-1.5 bg-[#1C2128]/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-[#30363D] hover:bg-[#1C2128] hover:border-[#2A84FF]/30 transition-all active:scale-95"
          >
            <Diamond size={16} className="text-[#2A84FF] fill-[#2A84FF]" />
            <span className="text-white font-bold text-xs">{diamonds}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
