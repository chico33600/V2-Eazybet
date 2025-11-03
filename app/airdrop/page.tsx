'use client';

import { HeaderCoins } from '@/components/header-coins';
import { BottomNav } from '@/components/bottom-nav';
import { Gift, Diamond, Check, TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';

const requirements = [
  { icon: Diamond, label: 'Accumuler au moins 100 diamants', progress: '0/100', completed: false },
  { icon: Users, label: 'Inviter 3 amis à rejoindre', progress: '0/3', completed: false },
  { icon: TrendingUp, label: 'Placer 20 paris gagnants', progress: '0/20', completed: false },
  { icon: Calendar, label: 'Être actif pendant 30 jours', progress: '0/30', completed: false },
];

export default function AirdropPage() {
  return (
    <>
      <HeaderCoins />
      <div className="min-h-screen pt-20 pb-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#F5C144]/20 to-[#F5C144]/10 border border-[#F5C144]/40 rounded-2xl p-6 mb-6 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C144]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2A84FF]/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="text-[#F5C144]" size={36} />
                <h1 className="text-3xl font-bold text-white">Airdrop Crypto</h1>
              </div>
              <p className="text-white/80 text-base leading-relaxed">
                Gagnez des tokens crypto gratuits en participant à notre programme d'airdrop exclusif !
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1C2128] to-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-[#2A84FF]" size={24} />
              <h2 className="text-xl font-bold text-white">Comment participer ?</h2>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Pour être éligible à l'airdrop, vous devez remplir tous les critères ci-dessous.
              Plus vous participez activement, plus vous augmentez vos chances de recevoir des tokens !
            </p>
            <div className="bg-[#2A84FF]/10 border border-[#2A84FF]/30 rounded-xl p-4">
              <p className="text-[#2A84FF] text-sm font-semibold text-center">
                🎁 Récompense estimée : 1000 - 5000 tokens par utilisateur éligible
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 px-1">Critères d'éligibilité</h3>
            <div className="space-y-3">
              {requirements.map((req, index) => {
                const Icon = req.icon;
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${
                      req.completed
                        ? 'from-[#4ADE80]/20 to-[#4ADE80]/10 border-[#4ADE80]/40'
                        : 'from-[#1C2128] to-[#161B22] border-[#30363D]'
                    } border rounded-2xl p-4 card-shadow`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full ${
                          req.completed ? 'bg-[#4ADE80]/20' : 'bg-[#0D1117]'
                        } flex items-center justify-center flex-shrink-0`}
                      >
                        {req.completed ? (
                          <Check className="text-[#4ADE80]" size={24} />
                        ) : (
                          <Icon
                            className={
                              Icon === Diamond ? 'text-[#2A84FF] fill-[#2A84FF]' : 'text-white/50'
                            }
                            size={24}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">{req.label}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#0D1117] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                req.completed ? 'bg-[#4ADE80]' : 'bg-white/20'
                              } transition-all`}
                              style={{ width: '0%' }}
                            />
                          </div>
                          <span className="text-white/50 text-xs font-medium whitespace-nowrap">
                            {req.progress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#C1322B]/20 to-[#C1322B]/10 border border-[#C1322B]/40 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Important à savoir
            </h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#F5C144] mt-0.5">•</span>
                <span>L'airdrop sera distribué à la fin de la période de qualification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5C144] mt-0.5">•</span>
                <span>Seuls les utilisateurs ayant rempli tous les critères recevront des tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5C144] mt-0.5">•</span>
                <span>La quantité de tokens dépendra de votre niveau d'activité global</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5C144] mt-0.5">•</span>
                <span>Les diamants accumulés augmentent votre part dans la distribution</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 bg-gradient-to-r from-[#2A84FF]/10 to-[#F5C144]/10 border border-[#2A84FF]/30 rounded-2xl p-5 text-center">
            <p className="text-white font-semibold mb-2">📅 Date de distribution</p>
            <p className="text-white/50 text-sm">
              La date sera annoncée prochainement. Restez actif pour maximiser vos gains !
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
