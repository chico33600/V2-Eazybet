'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Trophy, TrendingUp, Calendar, LogOut, Settings, ExternalLink, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: number;
  link: string | null;
  claimed: boolean;
}

interface UserRank {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
}

export default function ProfilPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(true);
  const { profile, signOut, refreshProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadAchievements();
    loadUserRank();
  }, [profile?.id]);

  const loadUserRank = async () => {
    if (!profile?.id) {
      setRankLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/leaderboard?userId=${profile.id}`);
      const data = await response.json();

      if (data.success && data.data.user_rank) {
        setUserRank(data.data.user_rank);
      }
    } catch (error) {
      console.error('Error loading user rank:', error);
    } finally {
      setRankLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('No auth token');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Achievements data:', data);
      if (data.achievements) {
        setAchievements(data.achievements);
      } else if (data.error) {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réalisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (achievementId: string, link: string | null, reward: number) => {
    const achievementIndex = achievements.findIndex(a => a.id === achievementId);
    if (achievementIndex === -1 || achievements[achievementIndex].claimed) {
      return;
    }

    if (link) {
      window.open(link, '_blank');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch('/api/achievements/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ achievementId })
      });

      const data = await response.json();

      if (!response.ok) {
        if (!data.error?.includes('déjà récupéré')) {
          alert(data.error || 'Erreur lors de la réclamation');
        }
        return;
      }

      setAchievements(prev => prev.map(a =>
        a.id === achievementId ? { ...a, claimed: true } : a
      ));

      alert(`+${reward} 💰 ajoutés à votre compte !`);
      await refreshProfile();
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error: any) {
      alert('Erreur lors de la réclamation de la récompense');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
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
    { icon: Award, label: 'Classement', value: rankLoading ? '...' : userRank ? `#${userRank.rank}` : 'N/A', color: 'text-purple-400' },
  ];

  return (
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
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/profil/edit')}
                  className="p-2 hover:bg-[#30363D] rounded-xl transition-colors"
                  title="Modifier le profil"
                >
                  <Settings className="text-white/50" size={24} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-[#30363D] rounded-xl transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="text-white/50" size={24} />
                </button>
              </div>
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
              const isRank = stat.label === 'Classement';
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-4 card-shadow ${
                    isRank && userRank && userRank.rank <= 3 ? 'ring-2 ring-purple-500/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} className={stat.color} />
                    <p className="text-white/50 text-sm">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  {isRank && userRank && userRank.rank <= 3 && (
                    <p className="text-xs text-purple-400 mt-1">🏆 Top 3!</p>
                  )}
                </div>
              );
            })}
          </div>

          <h3 className="text-xl font-bold text-white mb-4">🎖️ Réalisations</h3>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-white/50">Chargement...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50">Aucune réalisation disponible</p>
            </div>
          ) : (
            <div className="space-y-3 mb-32">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-2xl p-4 card-shadow transition-all ${
                    achievement.claimed
                      ? 'bg-gray-800/50 border border-gray-700/50 opacity-60'
                      : 'bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.claimed ? 'bg-gray-700/50' : 'bg-[#F5C144]/20'
                    }`}>
                      <Trophy className={achievement.claimed ? 'text-gray-500' : 'text-[#F5C144]'} size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold">{achievement.title}</h4>
                      <p className="text-white/50 text-sm">{achievement.description}</p>
                      <p className="text-[#F5C144] text-sm font-semibold mt-1">+{achievement.reward} 💰</p>
                    </div>
                    {achievement.claimed ? (
                      <div className="flex items-center gap-2">
                        {achievement.link && (
                          <a
                            href={achievement.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2A84FF] hover:text-[#4A9EFF] transition-colors p-2"
                            title="Voir le lien"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                        <span className="text-green-400 text-sm font-semibold">🎉 Réclamée</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaimReward(achievement.id, achievement.link, achievement.reward)}
                        className="bg-[#F5C144] hover:bg-[#E5B134] text-black font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                      >
                        Récupérer
                        {achievement.link && <ExternalLink size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  );
}
