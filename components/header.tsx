'use client';

import { useUserStore } from '@/lib/store';
import { Diamond } from 'lucide-react';

export function Header() {
  const { coins, diamonds } = useUserStore();

  return (
    <div className="fixed top-0 left-0 right-0 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span className="bg-gradient-to-r from-[#C1322B] to-[#E84545] bg-clip-text text-transparent">Eazy</span>
            <span className="text-white">bet</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg">
              <span className="text-white font-semibold">{coins.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg">
              <Diamond size={16} className="text-blue-400 fill-blue-400" />
            </div>
          </div>
        </div>

        <div className="text-white font-bold text-xl">
          + {coins.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
