'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferrerId(ref);
      setMode('signup');
    }
  }, [searchParams]);

  const extractReferrerIdFromLink = (link: string): string | null => {
    if (!link.trim()) return null;

    try {
      const url = new URL(link);
      const refParam = url.searchParams.get('ref');
      return refParam;
    } catch {
      const refMatch = link.match(/[?&]ref=([a-f0-9-]+)/i);
      return refMatch ? refMatch[1] : null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (mode === 'login') {
        result = await signIn(email, password);
      } else {
        if (username.length < 3) {
          setError('Le pseudo doit contenir au moins 3 caractères');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setIsLoading(false);
          return;
        }

        let finalReferrerId = referrerId;
        if (!finalReferrerId && referralLink.trim()) {
          finalReferrerId = extractReferrerIdFromLink(referralLink);
          if (!finalReferrerId) {
            setError('Lien de parrainage invalide');
            setIsLoading(false);
            return;
          }
        }

        result = await signUp(email, password, username);

        if (!result.error && result.data?.user?.id) {
          if (finalReferrerId) {
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));

              const response = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  referrerId: finalReferrerId,
                  referredId: result.data.user.id
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to create referral:', errorData);
                setSuccess('Inscription réussie 🎉');
              } else {
                const successData = await response.json();
                console.log('Referral created successfully:', successData);
                setSuccess('Inscription réussie 🎉 Vous et votre parrain avez reçu 10💎 et êtes maintenant amis !');
              }
            } catch (refError) {
              console.error('Failed to create referral:', refError);
              setSuccess('Inscription réussie 🎉');
            }
          } else {
            setSuccess('Inscription réussie 🎉');
          }

          setTimeout(() => {
            router.push('/');
          }, 2500);
          return;
        }
      }

      if (result.error) {
        if (result.error.includes('already taken') || result.error.includes('déjà pris')) {
          setError('Ce pseudo est déjà pris');
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      } else if (mode === 'login') {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B0000] to-[#000000] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">EazyBet</h1>
          <p className="text-white/70 text-sm">Pariez et gagnez facilement</p>
        </div>

        <div className="bg-[#1C2128]/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-[#30363D]">
          {referrerId && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm font-semibold text-center">
                🎉 Vous avez été parrainé! Vous et votre parrain recevrez 10 💎 chacun
              </p>
            </div>
          )}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#C1322B] text-white shadow-lg'
                  : 'bg-[#30363D] text-white/60 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-[#C1322B] text-white shadow-lg'
                  : 'bg-[#30363D] text-white/60 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="username" className="block text-white font-bold mb-2 text-sm">
                  Pseudo
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre pseudo"
                  required={mode === 'signup'}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C1322B] focus:ring-2 focus:ring-[#C1322B]/20 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white font-bold mb-2 text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C1322B] focus:ring-2 focus:ring-[#C1322B]/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-white font-bold text-sm">
                  Mot de passe
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[#C1322B] hover:text-[#F5C144] text-xs font-bold transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C1322B] focus:ring-2 focus:ring-[#C1322B]/20 transition-all"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-white font-bold mb-2 text-sm">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C1322B] focus:ring-2 focus:ring-[#C1322B]/20 transition-all"
                  />
                </div>

                {!referrerId && (
                  <div>
                    <label htmlFor="referralLink" className="block text-white font-bold mb-2 text-sm">
                      Lien de parrainage <span className="text-white/50 font-normal">(optionnel)</span>
                    </label>
                    <input
                      id="referralLink"
                      type="text"
                      value={referralLink}
                      onChange={(e) => setReferralLink(e.target.value)}
                      placeholder="https://eazybetcoin.app/auth?ref=..."
                      className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C1322B] focus:ring-2 focus:ring-[#C1322B]/20 transition-all"
                    />
                  </div>
                )}
              </>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm font-semibold text-center">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              variant="eazy"
              className="w-full py-4 text-lg rounded-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : (
                mode === 'login' ? 'Se connecter' : "S'inscrire"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              {mode === 'login' ? "Pas encore de compte ?" : 'Déjà inscrit ?'}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#C1322B] hover:text-[#F5C144] font-bold transition-colors underline"
              >
                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </p>
          </div>
        </div>

        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-3xl p-8 card-shadow max-w-md w-full">
              {resetSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">E-mail envoyé !</h3>
                  <p className="text-white/70 mb-6">
                    Si cet e-mail existe, vous recevrez un lien de réinitialisation dans quelques instants.
                  </p>
                  <Button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccess(false);
                      setResetEmail('');
                    }}
                    variant="eazy"
                    className="w-full py-3 rounded-xl"
                  >
                    Fermer
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-4">Mot de passe oublié</h3>
                  <p className="text-white/70 mb-6">
                    Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">E-mail</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-[#C1322B] transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setError('');
                          setResetEmail('');
                        }}
                        className="flex-1 py-3 bg-[#30363D] text-white font-bold rounded-xl hover:bg-[#40464D] transition-all"
                      >
                        Annuler
                      </button>
                      <Button
                        type="submit"
                        disabled={resetLoading}
                        variant="eazy"
                        className="flex-1 py-3 rounded-xl"
                      >
                        {resetLoading ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
