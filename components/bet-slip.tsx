'use client';

import { useState } from 'react';
import { useBetStore, useUserStore, useUserBetsStore, useMatchStatusStore, useBetSlipUIStore, useBadgeStore, UserBet } from '@/lib/store';
import { Coins, Diamond, X } from 'lucide-react';

export function BetSlip() {
  const { selections, removeSelection, clearSelections } = useBetStore();
  const { coins, diamonds, deductCoins, deductDiamonds, addDiamonds } = useUserStore();
  const { addBet } = useUserBetsStore();
  const { setMatchStatus } = useMatchStatusStore();
  const { isExpanded, setIsExpanded } = useBetSlipUIStore();
  const { setHasNewBet } = useBadgeStore();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'coins' | 'diamonds'>('coins');

  if (selections.length === 0) return null;

  const getBetTypeLabel = (selection: typeof selections[0]) => {
    switch (selection.betType) {
      case 'home':
        return `${selection.match.homeTeam} gagne`;
      case 'draw':
        return 'Match nul';
      case 'away':
        return `${selection.match.awayTeam} gagne`;
    }
  };

  const totalOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
  const betAmount = parseFloat(amount) || 0;
  const potentialWin = betAmount * totalOdds;
  const potentialProfit = potentialWin - betAmount;
  const potentialDiamondsFromCoins = currency === 'coins' ? potentialProfit * 0.01 : 0;
  const availableBalance = currency === 'coins' ? coins : diamonds;
  const isCombo = selections.length > 1;

  const handlePlaceBet = () => {
    if (!betAmount || betAmount <= 0 || betAmount > availableBalance) return;

    if (currency === 'coins') {
      deductCoins(betAmount);
    } else {
      deductDiamonds(betAmount);
    }

    const bet: UserBet = {
      id: `bet-${Date.now()}-${Math.random()}`,
      type: isCombo ? 'combo' : 'simple',
      selections: selections.map(s => ({
        match: s.match,
        betType: s.betType,
        odds: s.odds,
      })),
      totalOdds,
      amount: betAmount,
      currency,
      potentialWin,
      potentialDiamonds: potentialDiamondsFromCoins,
      status: 'pending',
      placedAt: Date.now(),
    };

    addBet(bet);

    selections.forEach((selection) => {
      setMatchStatus(selection.match.id, 'played');
    });

    setHasNewBet(true);
    setIsExpanded(false);
    clearSelections();
    setAmount('');
  };

  const handleRemoveSelection = (matchId: string) => {
    removeSelection(matchId);
    if (selections.length === 1) {
      setIsExpanded(false);
    }
  };

  const miniView = (
    <div
      onClick={() => setIsExpanded(true)}
      className="fixed bottom-20 left-0 right-0 z-40 px-4 cursor-pointer"
    >
      <div className="max-w-2xl mx-auto bg-[#1A1F27] backdrop-blur-lg rounded-t-3xl shadow-2xl border-t border-x border-[#30363D] p-4">
        {isCombo ? (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/70 text-xs">Pari combiné</p>
              <p className="text-white font-bold text-sm">{selections.length} sélections</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Cote totale</p>
              <p className="text-[#F5C144] font-bold text-lg">{totalOdds.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/70 text-xs">Sélection</p>
              <p className="text-white font-bold text-sm">{getBetTypeLabel(selections[0])}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Cote</p>
              <p className="text-[#F5C144] font-bold text-lg">{selections[0].odds.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const expandedView = (
    <div className="fixed inset-0 z-[100] flex items-end">
      <div
        onClick={() => setIsExpanded(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-2xl mx-auto bg-[#1A1F27] rounded-t-3xl shadow-2xl border-t border-x border-[#30363D] animate-slide-up max-h-[75vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-xl">
                {isCombo ? 'Pari combiné' : 'Votre pari'}
              </h2>
              {isCombo && (
                <p className="text-white/50 text-sm">{selections.length} sélections</p>
              )}
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                clearSelections();
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {selections.map((selection, index) => (
              <div
                key={`${selection.match.id}-${selection.betType}`}
                className="bg-[#0D1117] rounded-2xl p-4 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white/50 text-xs mb-1">{selection.match.league}</p>
                    <p className="text-white font-semibold text-sm">
                      {selection.match.homeTeam} vs {selection.match.awayTeam}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSelection(selection.match.id)}
                    className="text-white/50 hover:text-[#C1322B] transition-colors ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#F5C144] font-medium text-sm">{getBetTypeLabel(selection)}</p>
                  <p className="text-[#F5C144] font-bold text-xl">@{selection.odds.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {isCombo && (
            <div className="bg-gradient-to-r from-[#C1322B]/20 to-[#C1322B]/10 border border-[#C1322B]/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Cote combinée</p>
                <p className="text-[#C1322B] font-bold text-2xl">{totalOdds.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="text-white/70 text-sm mb-3 block">Parier avec</label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setCurrency('coins')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                  currency === 'coins'
                    ? 'bg-gradient-to-r from-[#F5C144] to-[#E5B134] text-black shadow-lg scale-105'
                    : 'bg-[#0D1117] text-white/70 border border-[#30363D] hover:border-[#F5C144]/50'
                }`}
              >
                <Coins size={20} className={currency === 'coins' ? 'text-black' : 'text-[#F5C144]'} />
                <span className="font-semibold">Jetons</span>
              </button>
              <button
                onClick={() => setCurrency('diamonds')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                  currency === 'diamonds'
                    ? 'bg-gradient-to-r from-[#2A84FF] to-[#1A74EF] text-white shadow-lg scale-105'
                    : 'bg-[#0D1117] text-white/70 border border-[#30363D] hover:border-[#2A84FF]/50'
                }`}
              >
                <Diamond size={20} className={currency === 'diamonds' ? 'text-white' : 'text-[#2A84FF]'} />
                <span className="font-semibold">Diamants</span>
              </button>
            </div>
            <label className="text-white/70 text-sm mb-2 block">Montant à miser</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0D1117] text-white text-2xl font-bold rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#C1322B] border border-[#30363D]"
            />
            <p className="text-white/50 text-xs mt-2">
              Solde disponible : {availableBalance.toFixed(2)} {currency === 'coins' ? 'jetons' : 'diamants'}
            </p>
          </div>

          {betAmount > 0 && (
            <div className="space-y-3 mb-6 animate-fade-in">
              {currency === 'coins' ? (
                <>
                  <div className="bg-gradient-to-r from-[#F5C144]/20 to-[#F5C144]/10 border border-[#F5C144]/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Coins size={20} className="text-[#F5C144]" />
                        <p className="text-white/70 text-sm">Gain potentiel en jetons</p>
                      </div>
                      <p className="text-[#F5C144] font-bold text-2xl">{potentialWin.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">Profit : +{potentialProfit.toFixed(2)} jetons</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#2A84FF]/20 to-[#2A84FF]/10 border border-[#2A84FF]/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Diamond size={20} className="text-[#2A84FF]" />
                        <p className="text-white/70 text-sm">Bonus en diamants</p>
                      </div>
                      <p className="text-[#2A84FF] font-bold text-2xl">+{potentialDiamondsFromCoins.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">1% du profit converti en diamants</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-r from-[#2A84FF]/20 to-[#2A84FF]/10 border border-[#2A84FF]/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Diamond size={20} className="text-[#2A84FF]" />
                      <p className="text-white/70 text-sm">Gain potentiel en diamants</p>
                    </div>
                    <p className="text-[#2A84FF] font-bold text-2xl">{potentialWin.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">Profit : +{potentialProfit.toFixed(2)} diamants</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-[#1A1F27] from-70% via-[#1A1F27] via-40% to-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <button
            onClick={handlePlaceBet}
            disabled={!amount || betAmount <= 0 || betAmount > availableBalance}
            className="w-full bg-gradient-to-r from-[#F5C144] to-[#E5B134] hover:from-[#E5B134] hover:to-[#D5A124] text-black font-bold py-5 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Valider le pari
          </button>
        </div>
      </div>
    </div>
  );

  return isExpanded ? expandedView : miniView;
}
