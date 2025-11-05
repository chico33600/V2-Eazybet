'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { earnTokens } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TapToEarnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
}

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
}

export function TapToEarnModal({ open, onOpenChange }: TapToEarnModalProps) {
  const [tapCount, setTapCount] = useState(0);
  const [activeTaps, setActiveTaps] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [rotationKey, setRotationKey] = useState(0);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const { refreshProfile } = useAuth();

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTaps >= 3) return;

    setTapCount((prev) => prev + 1);
    setActiveTaps((prev) => prev + 1);
    setRotationKey((prev) => prev + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFloatingText: FloatingText = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setFloatingTexts((prev) => [...prev, newFloatingText]);

    const ripple = document.createElement('div');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((text) => text.id !== newFloatingText.id));
    }, 800);

    setTimeout(() => {
      setActiveTaps((prev) => Math.max(0, prev - 1));
    }, 300);
  };

  const handleCollect = async () => {
    if (isCollecting || tapCount === 0) return;

    setIsCollecting(true);
    setShowButton(false);

    const coinCount = 5;
    const newCoins: FlyingCoin[] = [];

    for (let i = 0; i < coinCount; i++) {
      newCoins.push({
        id: Date.now() + Math.random() + i,
        startX: 0,
        startY: 0,
      });
    }

    setFlyingCoins(newCoins);

    const tokensToEarn = tapCount * 10;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tokens-earned', {
        detail: { amount: tokensToEarn }
      }));
    }

    try {
      await earnTokens(tapCount);
      await refreshProfile();
    } catch (error: any) {
      console.error('Error earning tokens:', error);
    }

    setTimeout(() => {
      setFlyingCoins([]);
      setIsCollecting(false);
      setTapCount(0);
      setShowButton(true);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-700/50 text-white max-w-md backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Gagnez des Jetons
          </DialogTitle>
          <p className="text-slate-400 text-center text-sm mt-2">
            Tapez rapidement pour accumuler des récompenses
          </p>
        </DialogHeader>

        <div className="py-10">
          <motion.div
            className="text-center mb-8 relative"
            animate={{
              scale: tapCount > 0 ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 blur-2xl bg-yellow-400/20 rounded-full"></div>
            <p className="text-6xl font-black bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg relative z-10">
              {tapCount}
            </p>
            <p className="text-slate-400 mt-3 text-sm font-medium tracking-wide uppercase relative z-10">
              Jetons gagnés
            </p>
          </motion.div>

          <motion.div
            onClick={handleTap}
            className="relative mx-auto w-56 h-56 rounded-full cursor-pointer select-none flex items-center justify-center overflow-visible"
            style={{
              userSelect: 'none',
            }}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/30 via-orange-400/20 to-red-400/30 blur-2xl animate-pulse"></div>

            <motion.div
              key={rotationKey}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-gradient-to-br from-white to-slate-100 p-8 shadow-2xl"
              style={{
                boxShadow: '0 0 0 4px rgba(245, 193, 68, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
              initial={{
                scale: 1,
              }}
              animate={{
                rotateZ: 360,
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 4px rgba(245, 193, 68, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5)',
                  '0 0 0 8px rgba(245, 193, 68, 0.5), 0 0 80px rgba(245, 193, 68, 0.6), 0 20px 80px rgba(0, 0, 0, 0.5)',
                  '0 0 0 4px rgba(245, 193, 68, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5)',
                ],
              }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
            >
              <Image
                src="/Logo EZBC .png"
                alt="EZBC Logo"
                width={160}
                height={160}
                className="pointer-events-none drop-shadow-lg"
                priority
              />
            </motion.div>

            <AnimatePresence>
              {floatingTexts.map((text) => (
                <motion.div
                  key={text.id}
                  className="absolute text-3xl font-black pointer-events-none"
                  style={{
                    left: text.x,
                    top: text.y,
                    background: 'linear-gradient(135deg, #FDE047, #FACC15, #F59E0B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 12px rgba(245, 193, 68, 0.9))',
                  }}
                  initial={{
                    opacity: 1,
                    y: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 0,
                    y: -50,
                    scale: 1.4,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  +1
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.p
            className="text-center text-slate-400 mt-8 text-sm font-medium"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Tapez sur le logo pour gagner des jetons
          </motion.p>

          {tapCount > 0 && showButton && (
            <motion.div
              className="flex justify-center mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handleCollect}
                className="relative px-6 py-3 text-white font-semibold text-sm rounded-full overflow-hidden shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #F5C144, #FF9A00)',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(245, 193, 68, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
                whileTap={{
                  scale: 0.95,
                }}
                disabled={isCollecting}
              >
                <span className="relative z-10">Récupérer tes jetons</span>
              </motion.button>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {flyingCoins.map((coin, index) => (
            <motion.div
              key={coin.id}
              className="absolute w-6 h-6 rounded-full pointer-events-none z-50"
              style={{
                background: 'linear-gradient(135deg, #FDE047, #F59E0B)',
                boxShadow: '0 0 15px rgba(245, 193, 68, 0.8)',
                left: '50%',
                bottom: '20%',
              }}
              initial={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: 0,
                x: 200 + index * 10,
                y: -250 - index * 15,
                scale: 1.2,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>

        <style jsx>{`
          .tap-ripple {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(245, 193, 68, 0.8) 0%, rgba(255, 107, 0, 0.4) 50%, transparent 100%);
            width: 30px;
            height: 30px;
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
            transform: translate(-50%, -50%);
            filter: blur(4px);
          }

          @keyframes ripple-animation {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
            100% {
              transform: translate(-50%, -50%) scale(5);
              opacity: 0;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
