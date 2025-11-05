'use client';

import { Clock, TrendingUp, Layers } from 'lucide-react';

interface ActiveComboBetCardProps {
  bet: {
    id: string;
    amount: number;
    bet_currency: string;
    total_odds: number;
    potential_win: number;
    potential_diamonds: number;
    created_at: string;
    combo_bet_selections: Array<{
      choice: string;
      odds: number;
      matches: {
        id: string;
        team_a: string;
        team_b: string;
        league: string;
        match_date: string;
        status: string;
      };
    }>;
  };
}

export function ActiveComboBetCard({ bet }: ActiveComboBetCardProps) {
  const getChoiceLabel = (choice: string, teamA: string, teamB: string) => {
    if (choice === 'A') return teamA;
    if (choice === 'B') return teamB;
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

  const currency = bet.bet_currency || 'tokens';
  const currencyLabel = currency === 'tokens' ? 'jetons' : 'diamants';
  const currencyColor = currency === 'tokens' ? '[#F5C144]' : '[#2A84FF]';

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/30 rounded-2xl p-4 shadow-lg hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-purple-400 text-xs font-bold">PARI COMBINÉ</p>
            <p className="text-white/70 text-xs">{bet.combo_bet_selections.length} sélections</p>
          </div>
        </div>
        <div className="bg-[#F5C144]/10 px-3 py-1 rounded-lg">
          <p className="text-[#F5C144] text-xs font-bold">En attente</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {bet.combo_bet_selections.map((selection, index) => (
          <div key={index} className="bg-[#0D1117] rounded-xl p-3 border border-purple-500/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-white/50 text-xs mb-1">{selection.matches.league}</p>
                <p className="text-white font-semibold text-sm">
                  {selection.matches.team_a} vs {selection.matches.team_b}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-white/40" />
                  <p className="text-white/40 text-xs">{formatDate(selection.matches.match_date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-400 font-bold text-sm">@{selection.odds.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-white/50 text-xs">Pronostic</p>
              <p className="text-white font-bold text-sm">
                {getChoiceLabel(selection.choice, selection.matches.team_a, selection.matches.team_b)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-purple-500/10 rounded-xl p-3 mb-3 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <p className="text-purple-300 text-sm font-bold">Cote totale</p>
          <p className="text-purple-400 font-bold text-xl">×{bet.total_odds.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className={`flex-1 bg-gradient-to-br from-${currencyColor}/20 to-${currencyColor}/5 border border-${currencyColor}/20 rounded-xl p-3`}>
          <p className="text-white/50 text-xs mb-1">Misé</p>
          <p className="text-white font-bold text-lg">{bet.amount}</p>
          <p className="text-white/40 text-xs">{currencyLabel}</p>
        </div>

        <div className="flex-1 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <p className="text-white/50 text-xs">Gain potentiel</p>
          </div>
          <p className="text-green-400 font-bold text-lg">{bet.potential_win}</p>
          {currency === 'tokens' && bet.potential_diamonds > 0 && (
            <p className="text-[#2A84FF] text-xs font-bold text-glow-diamond">+ {bet.potential_diamonds} diamants</p>
          )}
          {currency === 'diamonds' && (
            <p className="text-white/40 text-xs">diamants</p>
          )}
        </div>
      </div>
    </div>
  );
}
