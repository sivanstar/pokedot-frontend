import React, { useState } from 'react';
import { Zap, X, Gift } from 'lucide-react';

export const PointSystemBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
              <span className="font-bold">í¾‰ New Point System!</span>
              <span className="text-sm opacity-90">
                â€¢ Get <span className="font-bold">50 points</span> for each poke sent/received
              </span>
              <span className="text-sm opacity-90">
                â€¢ <span className="font-bold">500 points</span> signup bonus for new users
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
