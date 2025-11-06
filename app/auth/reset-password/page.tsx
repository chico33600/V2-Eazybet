'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-3xl p-8 card-shadow text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Mot de passe modifié !</h2>
          <p className="text-white/70">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#C1322B] to-[#8B1F1A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Nouveau mot de passe</h1>
          <p className="text-white/60">Choisissez un mot de passe sécurisé</p>
        </div>

        <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-3xl p-8 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
                placeholder="Minimum 6 caractères"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
                placeholder="Confirmer votre mot de passe"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#C1322B] to-[#8B1F1A] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
