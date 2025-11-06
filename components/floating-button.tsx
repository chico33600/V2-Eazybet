'use client';

import { Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FloatingButtonProps {
  onClick: () => void;
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
      <div className="max-w-2xl mx-auto">
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          animate={
            isAnimating
              ? {
                  scale: [0.98, 1.05, 1],
                  rotateZ: [0, -1, 1, 0],
                }
              : {
                  y: [0, -4, 0],
                }
          }
          transition={
            isAnimating
              ? {
                  duration: 0.6,
                  ease: 'easeOut',
                }
              : {
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
          }
          className="relative w-full text-white font-extrabold py-4 px-5 rounded-2xl
            flex items-center justify-center gap-2.5 overflow-hidden
            bg-gradient-to-br from-[#C1322B] via-[#8A2BE2] to-[#007BFF]
            hover:from-[#E03E34] hover:via-[#A040F0] hover:to-[#1A8FFF]
            shadow-[0_20px_50px_-12px_rgba(138,43,226,0.5),0_10px_25px_-5px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.2)]
            border-2 border-[#8A2BE2]/50
            backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] animate-shimmer" />

          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0"
            animate={
              isAnimating
                ? {
                    opacity: [0, 0.3, 0],
                    scale: [0.9, 1.1, 1.2],
                  }
                : {}
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(138,43,226,0.8) 0%, rgba(193,50,43,0) 70%)',
            }}
          />

          <motion.div
            className="relative z-10"
            animate={
              isAnimating
                ? {
                    rotate: [0, 360],
                    scale: [1, 1.3, 1],
                  }
                : {}
            }
            transition={{ duration: 0.6 }}
          >
            <Coins size={24} className="drop-shadow-md" strokeWidth={2.5} />
          </motion.div>

          <div className="relative z-10 flex items-center gap-2">
            <span className="text-lg tracking-tight drop-shadow-sm">
              Cliquer pour gagner des jetons
            </span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles size={18} className="text-white/70" />
            </motion.div>
          </div>

          <div className="absolute -top-1 -right-1 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-purple-500/20 rounded-full blur-xl" />
        </motion.button>
      </div>
    </div>
  );
}
