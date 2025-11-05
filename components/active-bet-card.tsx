'use client';

import { Clock, TrendingUp } from 'lucide-react';

interface ActiveBetCardProps {
  bet: {
    id: string;
    amount: number;
    choice: string;
    odds: number;
    potential_win: number;
    potential_diamonds: number;
    created_at: string;
    matches: {
      team_a: string;
      team_b: string;
      league: string;
      match_date: string;
    };
  };
}

export function ActiveBetCard({ bet }: ActiveBetCardProps) {
  const getChoiceLabel = () => {
    if (bet.choice === 'A') return bet.matches.team_a;
    if (bet.choice === 'B') return bet.matches.team_b;
    return 'Match nul';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-[#1C2128] border border-[#30363D] rounded-2xl p-4 shadow-lg hover:border-[#F5C144]/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-white/50 text-xs mb-1">{bet.matches.league}</p>
          <p className="text-white font-bold text-sm">
            {bet.matches.team_a} vs {bet.matches.team_b}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-white/40" />
            <p className="text-white/40 text-xs">{formatDate(bet.matches.match_date)}</p>
          </div>
        </div>
        <div className="bg-[#F5C144]/10 px-3 py-1 rounded-lg">
          <p className="text-[#F5C144] text-xs font-bold">En attente</p>
        </div>
      </div>

      <div className="bg-[#0D1117] rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/50 text-xs">Votre pronostic</p>
          <p className="text-white font-bold">{getChoiceLabel()}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-xs">Cote</p>
          <p className="text-[#F5C144] font-bold">{bet.odds.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-gradient-to-br from-[#F5C144]/20 to-[#F5C144]/5 border border-[#F5C144]/20 rounded-xl p-3">
          <p className="text-white/50 text-xs mb-1">Misé</p>
          <p className="text-white font-bold text-lg">{bet.amount}</p>
          <p className="text-white/40 text-xs">jetons</p>
        </div>

        <div className="flex-1 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <p className="text-white/50 text-xs">Gain potentiel</p>
          </div>
          <p className="text-green-400 font-bold text-lg">{bet.potential_win}</p>
          <p className="text-[#2A84FF] text-xs font-bold text-glow-diamond">+ {bet.potential_diamonds} diamants</p>
        </div>
      </div>
    </div>
  );
}
