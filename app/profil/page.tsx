'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Trophy, TrendingUp, Calendar, LogOut, RefreshCcw } from 'lucide-react';
import { resetUserAccount } from '@/lib/api-client';

export default function ProfilPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { profile, signOut, refreshProfile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser votre compte ? Tous vos paris et gains seront effacés. Cette action est irréversible.')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetUserAccount();
      await refreshProfile();
      alert('Compte réinitialisé avec succès !');
      router.push('/');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsResetting(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <p className="text-white text-center">Chargement...</p>
      </div>
    );
  }

  const stats = [
    { icon: Trophy, label: 'Paris total', value: profile.total_bets, color: 'text-[#F5C144]' },
    { icon: TrendingUp, label: 'Paris gagnés', value: profile.won_bets, color: 'text-green-400' },
    { icon: Calendar, label: 'Taux de réussite', value: `${profile.total_bets > 0 ? Math.round((profile.won_bets / profile.total_bets) * 100) : 0}%`, color: 'text-[#2A84FF]' },
  ];

  return (
    <>
    <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6 card-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C1322B] to-[#A02822] flex items-center justify-center text-white text-3xl font-bold">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{profile.username}</h2>
                <p className="text-white/50">Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#30363D] rounded-xl transition-colors"
                title="Déconnexion"
              >
                <LogOut className="text-white/50" size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0D1117] rounded-xl p-3 text-center">
                <p className="text-[#F5C144] text-2xl font-bold">{profile.tokens.toLocaleString()}</p>
                <p className="text-white/50 text-sm">Jetons</p>
              </div>
              <div className="bg-[#0D1117] rounded-xl p-3 text-center">
                <p className="text-[#2A84FF] text-2xl font-bold">{profile.diamonds.toLocaleString()}</p>
                <p className="text-white/50 text-sm">Diamants</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Statistiques</h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 card-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} className={stat.color} />
                    <p className="text-white/50 text-sm">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Réalisations</h3>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-[#F5C144]/20 to-[#E5B134]/10 border border-[#F5C144]/30 rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F5C144]/20 flex items-center justify-center">
                  <Trophy className="text-[#F5C144]" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">Premier Pari</h4>
                  <p className="text-white/50 text-sm">Placer votre premier pari</p>
                </div>
                <span className="text-[#F5C144] font-bold">✓</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 opacity-50 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0D1117] flex items-center justify-center">
                  <Trophy className="text-white/30" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">Série de Victoires</h4>
                  <p className="text-white/50 text-sm">Gagner 5 paris d'affilée</p>
                </div>
                <span className="text-white/30 font-bold">🔒</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 opacity-50 card-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0D1117] flex items-center justify-center">
                  <TrendingUp className="text-white/30" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">Expert</h4>
                  <p className="text-white/50 text-sm">Atteindre 100 paris gagnés</p>
                </div>
                <span className="text-white/30 font-bold">🔒</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCcw size={20} className={isResetting ? 'animate-spin' : ''} />
              {isResetting ? 'Réinitialisation...' : 'Réinitialiser le compte'}
            </button>
          </div>

        </div>
    </>
  );
}
