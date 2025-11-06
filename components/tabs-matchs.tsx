'use client';

import { useBadgeStore } from '@/lib/store';

interface TabsMatchsProps {
  activeTab: 'upcoming' | 'played' | 'finished';
  onTabChange: (tab: 'upcoming' | 'played' | 'finished') => void;
}

export function TabsMatchs({ activeTab, onTabChange }: TabsMatchsProps) {
  const { hasNewBet, hasNewResult, setHasNewBet, setHasNewResult } = useBadgeStore();

  const handlePlayedClick = () => {
    setHasNewBet(false);
    onTabChange('played');
  };

  const handleFinishedClick = () => {
    setHasNewResult(false);
    onTabChange('finished');
  };

  return (
    <div className="flex items-center gap-2 bg-[#1C2128] rounded-2xl p-1 border border-[#30363D]">
      <button
        onClick={() => onTabChange('upcoming')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out ${
          activeTab === 'upcoming'
            ? 'bg-gradient-to-r from-[#C1322B] to-[#A02822] text-white shadow-lg glow-red'
            : 'text-white/60 hover:text-white hover:bg-[#30363D]/30'
        }`}
      >
        À venir
      </button>

      <button
        onClick={handlePlayedClick}
        className={`relative flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out ${
          activeTab === 'played'
            ? 'bg-gradient-to-r from-[#C1322B] to-[#A02822] text-white shadow-lg glow-red'
            : 'text-white/60 hover:text-white hover:bg-[#30363D]/30'
        }`}
      >
        Joués
        {hasNewBet && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            1
          </span>
        )}
      </button>

      <button
        onClick={handleFinishedClick}
        className={`relative flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out ${
          activeTab === 'finished'
            ? 'bg-gradient-to-r from-[#C1322B] to-[#A02822] text-white shadow-lg glow-red'
            : 'text-white/60 hover:text-white hover:bg-[#30363D]/30'
        }`}
      >
        Résultats
        {hasNewResult && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            1
          </span>
        )}
      </button>
    </div>
  );
}
