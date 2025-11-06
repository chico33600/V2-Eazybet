'use client';

import { Match } from '@/lib/mock-data';
import { useBetStore, BetType } from '@/lib/store';
import Image from 'next/image';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === 'finished' || match.status === 'played';
  const { selections, toggleSelection } = useBetStore();

  const handleOddsClick = (betType: BetType, odds: number) => {
    toggleSelection({ match, betType, odds });
  };

  const isSelected = (betType: BetType) => {
    return selections.some(s => s.match.id === match.id && s.betType === betType);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden card-shadow border border-[#30363D] h-[360px]">
      <Image
        src={match.imageUrl || 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg'}
        alt={`${match.homeTeam} vs ${match.awayTeam}`}
        fill
        className="object-cover"
        unoptimized
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.0) 70%)'
        }}
      />

      <div className="absolute top-3 left-3 bg-[#C1322B]/90 backdrop-blur-sm px-3 py-1 rounded-full z-10">
        <p className="text-white text-xs font-semibold">{match.league}</p>
      </div>

      <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-between p-4 z-10">
        <div></div>

        <div>
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3 inline-block">
            <p className="text-white text-xs font-medium">{match.datetime}</p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <p className="text-white font-bold text-lg">{match.homeTeam}</p>
              {isFinished && (
                <p className="text-[#F5C144] font-bold text-3xl mt-1">{match.homeScore}</p>
              )}
            </div>

            <div className="px-4">
              {isFinished ? (
                <p className="text-white/50 font-bold text-2xl">-</p>
              ) : (
                <p className="text-white/50 text-sm">VS</p>
              )}
            </div>

            <div className="text-center flex-1">
              <p className="text-white font-bold text-lg">{match.awayTeam}</p>
              {isFinished && (
                <p className="text-[#F5C144] font-bold text-3xl mt-1">{match.awayScore}</p>
              )}
            </div>
          </div>

          {!isFinished && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleOddsClick('home', match.homeOdds)}
                className={`rounded-2xl py-3 px-2 transition-all duration-200 ease-in-out active:scale-95 hover:scale-105 backdrop-blur-md shadow-lg ${
                  isSelected('home')
                    ? 'bg-[#C1322B] text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isSelected('home') ? 'text-white/90' : 'text-white/70'}`}>
                  1
                </p>
                <p className="font-bold text-xl text-white">
                  {match.homeOdds.toFixed(2)}
                </p>
              </button>

              <button
                onClick={() => handleOddsClick('draw', match.drawOdds)}
                className={`rounded-2xl py-3 px-2 transition-all duration-200 ease-in-out active:scale-95 hover:scale-105 backdrop-blur-md shadow-lg ${
                  isSelected('draw')
                    ? 'bg-[#C1322B] text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isSelected('draw') ? 'text-white/90' : 'text-white/70'}`}>
                  N
                </p>
                <p className="font-bold text-xl text-white">
                  {match.drawOdds.toFixed(2)}
                </p>
              </button>

              <button
                onClick={() => handleOddsClick('away', match.awayOdds)}
                className={`rounded-2xl py-3 px-2 transition-all duration-200 ease-in-out active:scale-95 hover:scale-105 backdrop-blur-md shadow-lg ${
                  isSelected('away')
                    ? 'bg-[#C1322B] text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isSelected('away') ? 'text-white/90' : 'text-white/70'}`}>
                  2
                </p>
                <p className="font-bold text-xl text-white">
                  {match.awayOdds.toFixed(2)}
                </p>
              </button>
            </div>
          )}

          {isFinished && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl py-3 px-4 text-center border border-white/20">
              <p className="text-white/70 text-sm">Match terminé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
