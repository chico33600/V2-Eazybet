'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, User, Mail, Lock, Save, Camera } from 'lucide-react';

export default function EditProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      const updates: any = {};
      if (username !== profile?.username) updates.username = username;
      if (email !== user?.email) updates.email = email;
      if (newPassword) updates.password = newPassword;
      if (avatarUrl !== profile?.avatar_url) updates.avatar_url = avatarUrl;

      if (Object.keys(updates).length === 0) {
        setError('Aucune modification à enregistrer');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      await refreshProfile();
      window.dispatchEvent(new Event('profile-updated'));

      setSuccess('Profil mis à jour avec succès !');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');

      setTimeout(() => {
        router.push('/profil');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-white text-center">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#30363D] rounded-xl transition-colors"
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Modifier le profil</h1>
      </div>

      <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-6 card-shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C1322B] to-[#A02822] flex items-center justify-center text-white text-4xl font-bold mb-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-[#C1322B] rounded-full hover:bg-[#8B1F1A] transition-colors"
                title="Changer la photo"
              >
                <Camera size={16} className="text-white" />
              </button>
            </div>
            <p className="text-white/50 text-sm mt-2">Cliquez pour changer la photo</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <User size={16} />
              Pseudo
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
              placeholder="Votre pseudo"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <Mail size={16} />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="border-t border-[#30363D] pt-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={20} />
              Changer le mot de passe
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Laissez vide si vous ne souhaitez pas modifier votre mot de passe
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-3">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#C1322B] to-[#8B1F1A] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
}
