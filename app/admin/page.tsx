'use client';

import { useState, useEffect } from 'react';
import { fetchMatches } from '@/lib/api-client';
import type { Match } from '@/lib/supabase-client';
import { Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';

export default function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    console.log('[AdminPage] Profile loaded:', profile);
    console.log('[AdminPage] User role:', profile?.role);
    console.log('[AdminPage] Is admin:', isAdmin);
  }, [profile, isAdmin]);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    const data = await fetchMatches();
    setMatches(data);
    setLoading(false);
  }

  async function handleResolveMatch(matchId: string, result: 'A' | 'Draw' | 'B') {
    if (!confirm('Êtes-vous sûr de vouloir résoudre ce match ?')) return;

    setResolving(matchId);

    try {
      const response = await fetch('/api/matches/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, result }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Match résolu avec succès ! ${data.processed} paris traités.`);
        await loadMatches();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setResolving(null);
    }
  }

  async function handleSimulateMatch(matchId: string) {
    if (!confirm('Simuler un résultat aléatoire pour ce match ?')) return;

    setResolving(matchId);

    try {
      const response = await fetch('/api/matches/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, simulate: true }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Match simulé avec succès ! ${data.processed} paris traités.`);
        await loadMatches();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setResolving(null);
    }
  }

  async function handleSyncRealMatches() {
    if (!confirm('Rafraîchir les matchs réels depuis l\'API ?')) return;

    setSyncing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('Erreur : Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/matches/sync-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Synchronisation réussie !\n${data.stats.synced} nouveaux matchs\n${data.stats.updated} matchs mis à jour\n${data.stats.errors} erreurs`);
        await loadMatches();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setSyncing(false);
    }
  }

  async function handleAddDemoMatches() {
    if (!confirm('Ajouter 12 matchs de démonstration ?')) return;

    setSyncing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('Erreur : Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/matches/add-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Matchs de démo ajoutés !\n${data.stats.added} matchs ajoutés\n${data.stats.errors} erreurs`);
        await loadMatches();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-white text-center">Chargement...</p>
      </div>
    );
  }

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const finishedMatches = matches.filter(m => m.status === 'finished');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20">
            <Trophy className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
            <p className="text-sm text-white/50">Résoudre les matchs</p>
            <p className="text-xs text-yellow-400 mt-1">Debug: Role={profile?.role || 'undefined'}, isAdmin={isAdmin.toString()}</p>
          </div>
        </div>
        {isAdmin ? (
          <div className="flex gap-2">
            <button
              onClick={handleAddDemoMatches}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Ajout...' : 'Matchs Demo'}
            </button>
            <button
              onClick={handleSyncRealMatches}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synchronisation...' : 'Sync API'}
            </button>
          </div>
        ) : (
          <div className="text-xs text-red-400">Bouton admin masqué (pas admin)</div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Matchs en attente</h2>
        {upcomingMatches.length === 0 ? (
          <p className="text-white/50">Aucun match en attente</p>
        ) : (
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="bg-[#1C2128] border border-[#30363D] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/50 text-xs mb-1">{match.league}</p>
                    <p className="text-white font-bold">
                      {match.team_a} vs {match.team_b}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Cotes: {match.odds_a.toFixed(2)} / {match.odds_draw.toFixed(2)} / {match.odds_b.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveMatch(match.id, 'A')}
                    disabled={resolving === match.id}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50"
                  >
                    {match.team_a} gagne
                  </button>
                  <button
                    onClick={() => handleResolveMatch(match.id, 'Draw')}
                    disabled={resolving === match.id}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg disabled:opacity-50"
                  >
                    Match nul
                  </button>
                  <button
                    onClick={() => handleResolveMatch(match.id, 'B')}
                    disabled={resolving === match.id}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50"
                  >
                    {match.team_b} gagne
                  </button>
                </div>

                <button
                  onClick={() => handleSimulateMatch(match.id)}
                  disabled={resolving === match.id}
                  className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  Simuler résultat aléatoire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Matchs terminés ({finishedMatches.length})</h2>
        <div className="space-y-2">
          {finishedMatches.slice(0, 5).map((match) => (
            <div
              key={match.id}
              className="bg-[#1C2128]/50 border border-[#30363D] rounded-xl p-3"
            >
              <p className="text-white/50 text-xs mb-1">{match.league}</p>
              <p className="text-white text-sm">
                {match.team_a} vs {match.team_b}
              </p>
              <p className="text-green-400 text-xs mt-1">
                Résultat: {match.result === 'A' ? match.team_a : match.result === 'B' ? match.team_b : 'Match nul'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
