'use client';

import { useState, useEffect } from 'react';
import { TabsMatchs } from '@/components/tabs-matchs';
import { LeagueSection } from '@/components/league-section';
import { BetSlip } from '@/components/bet-slip';
import { BetTicket } from '@/components/bet-ticket';
import { mockMatches } from '@/lib/mock-data';
import { getFilteredMatches } from '@/lib/match-utils';
import { useMatchStatusStore, useUserBetsStore, useNavigationStore } from '@/lib/store';
import { startMatchSimulation, stopMatchSimulation } from '@/lib/match-simulator';
import { Ticket, Trophy } from 'lucide-react';

export default function Home() {
  const { activeHomeTab: activeTab, setActiveHomeTab: setActiveTab } = useNavigationStore();
  const [mounted, setMounted] = useState(false);
  const matchStatusStore = useMatchStatusStore();
  const betsStore = useUserBetsStore();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);

    startMatchSimulation(15000);

    return () => {
      clearInterval(interval);
      stopMatchSimulation();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="px-4">
          <TabsMatchs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    );
  }

  const filteredMatches = getFilteredMatches(mockMatches, activeTab);

  const leagueGroups = filteredMatches.reduce((acc, match) => {
    const existing = acc.find((group) => group.league === match.league);
    if (existing) {
      existing.matches.push(match);
    } else {
      acc.push({ league: match.league, matches: [match] });
    }
    return acc;
  }, [] as { league: string; matches: typeof mockMatches }[]);

  const pendingBets = betsStore.getBetsByStatus('pending') || [];
  const wonBets = betsStore.getBetsByStatus('won') || [];
  const lostBets = betsStore.getBetsByStatus('lost') || [];
  const finishedBets = [...wonBets, ...lostBets].sort((a, b) => b.placedAt - a.placedAt);

  const renderContent = () => {
    if (activeTab === 'upcoming') {
      return (
        <div className="mt-6">
          {leagueGroups.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-[#1A1F27] border border-[#30363D] rounded-2xl p-8 shadow-xl">
                <p className="text-white text-lg font-semibold mb-2">Aucun match à venir</p>
                <p className="text-gray-400 text-sm">
                  Les prochains matchs apparaîtront ici !
                </p>
              </div>
            </div>
          ) : (
            leagueGroups.map((leagueGroup) => (
              <LeagueSection key={leagueGroup.league} leagueGroup={leagueGroup} />
            ))
          )}
        </div>
      );
    }

    if (activeTab === 'played') {
      return (
        <div className="mt-6 px-4">
          <div className="flex items-center gap-2 mb-6">
            <Ticket className="text-[#F5C144]" size={24} />
            <h2 className="text-xl font-bold text-white">Paris en cours</h2>
            <span className="bg-[#F5C144]/20 text-[#F5C144] text-xs font-bold px-2 py-1 rounded-full">
              {pendingBets.length}
            </span>
          </div>

          {pendingBets.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-[#1A1F27] border border-[#30363D] rounded-2xl p-8 shadow-xl">
                <div className="bg-[#F5C144]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="text-[#F5C144]" size={40} />
                </div>
                <p className="text-white text-lg font-semibold mb-2">Aucun pari en cours</p>
                <p className="text-gray-400 text-sm">
                  Placez des paris pour les voir apparaître ici !
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBets
                .filter(bet => bet && bet.selections && bet.selections.length > 0)
                .map((bet) => (
                  <BetTicket
                    key={bet.id}
                    id={bet.id}
                    type={bet.type}
                    selections={bet.selections}
                    totalOdds={bet.totalOdds}
                    stake={bet.amount}
                    currency={bet.currency}
                    potentialWin={bet.potentialWin}
                    potentialDiamonds={bet.potentialDiamonds}
                    status={bet.status}
                    placedAt={bet.placedAt}
                  />
                ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'finished') {
      return (
        <div className="mt-6 px-4">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-[#F5C144]" size={24} />
            <h2 className="text-xl font-bold text-white">Paris terminés</h2>
            <span className="bg-[#F5C144]/20 text-[#F5C144] text-xs font-bold px-2 py-1 rounded-full">
              {finishedBets.length}
            </span>
          </div>

          {finishedBets.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-[#1A1F27] border border-[#30363D] rounded-2xl p-8 shadow-xl">
                <div className="bg-[#F5C144]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-[#F5C144]" size={40} />
                </div>
                <p className="text-white text-lg font-semibold mb-2">Aucun résultat</p>
                <p className="text-gray-400 text-sm">
                  Vos paris terminés apparaîtront ici !
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {finishedBets
                .filter(bet => bet && bet.selections && bet.selections.length > 0)
                .map((bet) => (
                  <BetTicket
                    key={bet.id}
                    id={bet.id}
                    type={bet.type}
                    selections={bet.selections}
                    totalOdds={bet.totalOdds}
                    stake={bet.amount}
                    currency={bet.currency}
                    potentialWin={bet.potentialWin}
                    potentialDiamonds={bet.potentialDiamonds}
                    status={bet.status}
                    placedAt={bet.placedAt}
                  />
                ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4">
        <TabsMatchs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {renderContent()}

      <BetSlip />
    </div>
  );
}
