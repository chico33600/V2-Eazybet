'use client';

import { HeaderCoins } from '@/components/header-coins';
import { BottomNav } from '@/components/bottom-nav';
import { Trophy, Medal, Diamond, TrendingUp } from 'lucide-react';

interface Player {
  rank: number;
  name: string;
  diamonds: number;
  winRate: number;
  avatar: string;
}

const mockPlayers: Player[] = [
  { rank: 1, name: 'ProBettor', diamonds: 1250.567, winRate: 78, avatar: '👑' },
  { rank: 2, name: 'BetKing', diamonds: 1100.234, winRate: 72, avatar: '🔥' },
  { rank: 3, name: 'LuckyPlayer', diamonds: 980.123, winRate: 69, avatar: '⚡' },
  { rank: 4, name: 'DiamondHunter', diamonds: 875.456, winRate: 65, avatar: '💎' },
  { rank: 5, name: 'StrategyMaster', diamonds: 790.789, winRate: 71, avatar: '🎯' },
  { rank: 6, name: 'WinStreak', diamonds: 720.345, winRate: 68, avatar: '🌟' },
  { rank: 7, name: 'BetExpert', diamonds: 680.234, winRate: 66, avatar: '🎲' },
  { rank: 8, name: 'FortuneSeeker', diamonds: 650.123, winRate: 64, avatar: '🍀' },
  { rank: 9, name: 'Champion', diamonds: 610.567, winRate: 70, avatar: '🏆' },
  { rank: 10, name: 'RisingStar', diamonds: 580.456, winRate: 63, avatar: '✨' },
];

export default function ClassementPage() {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-[#FFD700] to-[#FFA500]';
    if (rank === 2) return 'from-[#C0C0C0] to-[#808080]';
    if (rank === 3) return 'from-[#CD7F32] to-[#8B4513]';
    return 'from-[#1C2128] to-[#161B22]';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-[#FFD700]" size={24} />;
    if (rank === 2) return <Medal className="text-[#C0C0C0]" size={24} />;
    if (rank === 3) return <Medal className="text-[#CD7F32]" size={24} />;
    return <span className="text-white/50 font-bold text-lg">#{rank}</span>;
  };

  return (
    <>
      <HeaderCoins />
      <div className="min-h-screen pt-20 pb-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6 card-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-[#F5C144]" size={32} />
              <h1 className="text-3xl font-bold text-white">Classement</h1>
            </div>
            <p className="text-white/50 text-sm">
              Les meilleurs joueurs classés par diamants gagnés
            </p>
          </div>

          <div className="space-y-3">
            {mockPlayers.map((player) => (
              <div
                key={player.rank}
                className={`bg-gradient-to-br ${getRankColor(player.rank)} border ${
                  player.rank <= 3 ? 'border-opacity-50' : 'border-[#30363D]'
                } rounded-2xl p-4 card-shadow transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                  </div>

                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C1322B] to-[#8B1F1A] flex items-center justify-center text-2xl shadow-lg">
                    {player.avatar}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{player.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Diamond size={14} className="text-[#2A84FF] fill-[#2A84FF]" />
                        <span className="text-[#2A84FF] font-bold text-sm">
                          {player.diamonds.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-[#4ADE80]" />
                        <span className="text-[#4ADE80] font-bold text-sm">{player.winRate}%</span>
                      </div>
                    </div>
                  </div>

                  {player.rank <= 3 && (
                    <div className="flex-shrink-0">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          player.rank === 1
                            ? 'bg-[#FFD700] text-black'
                            : player.rank === 2
                            ? 'bg-[#C0C0C0] text-black'
                            : 'bg-[#CD7F32] text-white'
                        }`}
                      >
                        TOP {player.rank}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-br from-[#2A84FF]/20 to-[#2A84FF]/10 border border-[#2A84FF]/40 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Diamond size={24} className="text-[#2A84FF] fill-[#2A84FF]" />
              <div>
                <h3 className="text-white font-bold mb-1">Gagner des diamants</h3>
                <p className="text-white/70 text-sm">
                  Pariez avec des jetons pour gagner des diamants et grimper dans le classement !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
