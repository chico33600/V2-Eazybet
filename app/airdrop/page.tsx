'use client';

import { useEffect } from 'react';
import { Gift, CheckCircle2, Sparkles, Calendar, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AirdropPage() {
  const { profile, refreshProfile } = useAuth();
  const diamonds = profile?.diamonds || 0;
  const eligibilityThreshold = 1000;
  const isEligible = diamonds >= eligibilityThreshold;

  useEffect(() => {
    const handleBetPlaced = () => {
      refreshProfile();
    };

    const handleProfileUpdated = () => {
      refreshProfile();
    };

    window.addEventListener('bet-placed', handleBetPlaced);
    window.addEventListener('profile-updated', handleProfileUpdated);

    return () => {
      window.removeEventListener('bet-placed', handleBetPlaced);
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  }, [refreshProfile]);

  const criteria = [
    { icon: Trophy, label: 'Accumuler 1000 💎 diamants minimum', achieved: isEligible },
    { icon: Users, label: 'Parrainer 3 amis', achieved: false },
    { icon: Calendar, label: 'Être actif pendant 30 jours', achieved: false },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Gift className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Airdrop Crypto</h1>
            <p className="text-sm text-white/50">Gagnez des tokens gratuits</p>
          </div>
        </div>

        <div className="glassmorphism rounded-3xl p-6 mb-6 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Airdrop EazyBet Token</h2>
          </div>
          <p className="text-white/80 mb-4 leading-relaxed">
            Participez à notre programme d'airdrop et recevez des <span className="font-bold text-purple-400">$EZBT tokens</span> gratuitement!
            Les tokens seront distribués proportionnellement aux diamants accumulés.
          </p>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0D1117]/50 border border-purple-500/20">
            <div>
              <p className="text-sm text-white/50 mb-1">Vos diamants</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <span className="text-2xl font-bold text-white">{diamonds.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/50 mb-1">Tokens estimés</p>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {(diamonds * 10).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="glassmorphism rounded-3xl p-6 mb-6 border border-[#30363D]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#C1322B]" />
            Critères d'éligibilité
          </h3>
          <div className="space-y-3">
            {criteria.map((criterion, index) => {
              const Icon = criterion.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    criterion.achieved
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-[#0D1117]/50 border-[#30363D]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${criterion.achieved ? 'text-green-400' : 'text-white/40'}`} />
                  <span className={`flex-1 ${criterion.achieved ? 'text-white' : 'text-white/60'}`}>
                    {criterion.label}
                  </span>
                  {criterion.achieved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`glassmorphism rounded-3xl p-6 border-2 ${
          isEligible
            ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10'
            : 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/10'
        }`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isEligible ? 'bg-green-500/20' : 'bg-orange-500/20'
            }`}>
              {isEligible ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : (
                <Gift className="w-8 h-8 text-orange-400" />
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              isEligible ? 'text-green-400' : 'text-orange-400'
            }`}>
              {isEligible ? 'Vous êtes éligible!' : 'Continuez vos efforts!'}
            </h3>
            <p className="text-white/70 mb-4">
              {isEligible
                ? 'Félicitations! Vous remplissez déjà certains critères pour l\'airdrop. Continuez à accumuler des diamants pour maximiser vos tokens.'
                : `Il vous manque ${eligibilityThreshold - diamonds} 💎 diamants pour être éligible au premier critère de l'airdrop.`
              }
            </p>
            {!isEligible && (
              <div className="p-4 rounded-2xl bg-[#0D1117]/50 border border-orange-500/20">
                <p className="text-sm text-white/60">
                  <span className="font-bold text-orange-400">Astuce:</span> Placez des paris avec des cotes élevées pour gagner plus de diamants rapidement!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Date de distribution</p>
              <p className="text-sm text-white/70">
                L'airdrop sera distribué le <span className="font-bold text-blue-400">31 Décembre 2025</span>.
                Plus vous accumulez de diamants, plus vous recevrez de tokens!
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
