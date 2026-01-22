import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

interface PokeAnimationProps {
  isVisible: boolean;
  pointsEarned: number;
  onComplete: () => void;
}

export const PokeAnimation: React.FC<PokeAnimationProps> = ({
  isVisible,
  pointsEarned,
  onComplete,
}) => {
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowPoints(true);
      }, 300);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
          />

          {/* Poke animation */}
          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="relative"
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl">
              <Zap className="w-24 h-24 text-white" />
            </div>

            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute"
                style={{
                  left: `${Math.cos((i * Math.PI) / 4) * 120}px`,
                  top: `${Math.sin((i * Math.PI) / 4) * 120}px`,
                }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
            ))}
          </motion.div>

          {/* Points earned */}
          <AnimatePresence>
            {showPoints && (
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -100, opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="text-4xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full shadow-lg">
                  +{pointsEarned} Points!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};