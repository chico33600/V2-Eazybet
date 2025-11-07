'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Trophy, Medal, Award, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
}

interface UserRank {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
}

export function LeaderboardList() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  const LIMIT = 50;

  async function loadLeaderboard(isLoadMore = false) {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentOffset = isLoadMore ? offset : 0;
      const response = await fetch(`/api/leaderboard?limit=${LIMIT}&offset=${currentOffset}`);
      const data = await response.json();

      if (data.success) {
        const newEntries = data.data.leaderboard;
        setTotal(data.data.total);

        if (isLoadMore) {
          setEntries((prev) => [...prev, ...newEntries]);
          setOffset(currentOffset + newEntries.length);
        } else {
          setEntries(newEntries);
          setOffset(newEntries.length);
        }

        setHasMore(newEntries.length === LIMIT && currentOffset + newEntries.length < data.data.total);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function loadUserRank() {
    if (!profile?.id) return;

    try {
      const response = await fetch(`/api/leaderboard?userId=${profile.id}`);
      const data = await response.json();

      if (data.success && data.data.user_rank) {
        setUserRank(data.data.user_rank);
      }
    } catch (error) {
      console.error('Error loading user rank:', error);
    }
  }

  useEffect(() => {
    loadLeaderboard();
    loadUserRank();
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadLeaderboard(true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, offset]);

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-slate-400" />;
    }
  }

  function getRankColor(rank: number) {
    switch (rank) {
      case 1:
        return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 2:
        return 'from-gray-300 via-gray-400 to-gray-500';
      case 3:
        return 'from-amber-500 via-amber-600 to-orange-700';
      default:
        return 'from-slate-600 via-slate-700 to-slate-800';
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 mt-4">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-2 border-purple-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">{userRank.username}</p>
                <p className="text-slate-400 text-sm">Votre position</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                #{userRank.rank}
              </p>
              <p className="text-yellow-400 font-bold text-sm">{userRank.score.toLocaleString()} 💎</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {entries.map((entry, index) => {
            const isCurrentUser = profile?.id === entry.user_id;
            const isTopThree = entry.rank <= 3;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`
                  relative overflow-hidden rounded-xl p-4 transition-all
                  ${isCurrentUser
                    ? 'bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-slate-900 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : isTopThree
                    ? `bg-gradient-to-br ${getRankColor(entry.rank)} border border-white/10`
                    : 'bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50'
                  }
                `}
              >
                {isTopThree && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10">
                      {entry.rank <= 3 ? (
                        getRankIcon(entry.rank)
                      ) : (
                        <span className={`text-xl font-bold ${isCurrentUser ? 'text-purple-400' : 'text-slate-400'}`}>
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-2 border-slate-600">
                      <User className={`w-5 h-5 ${isCurrentUser ? 'text-purple-400' : 'text-slate-400'}`} />
                    </div>

                    <div>
                      <p className={`font-bold ${isTopThree ? 'text-white text-lg' : isCurrentUser ? 'text-purple-300' : 'text-slate-200'}`}>
                        {entry.username}
                        {isCurrentUser && <span className="ml-2 text-xs text-purple-400">(Vous)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-2xl font-black ${isTopThree ? 'text-white' : isCurrentUser ? 'text-purple-300' : 'text-slate-300'}`}>
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-yellow-400 text-xs font-semibold">💎 Diamants</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {hasMore && (
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span>Chargement...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && entries.length > 0 && (
          <div className="text-center py-8 text-slate-500">
            Fin du classement ({total} joueurs)
          </div>
        )}

        {entries.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p>Aucun joueur dans le classement pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
