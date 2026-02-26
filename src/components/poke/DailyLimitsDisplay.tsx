import React from 'react';
import { Clock, Zap, Users, Calendar } from 'lucide-react';
import { usePoke } from '../../context/PokeContext';

export const DailyLimitsDisplay: React.FC = () => {
  const { dailyLimits } = usePoke();
  
  const getProgressPercentage = (remaining: number) => {
    return Math.max(0, ((2 - remaining) / 2) * 100);
  };

  const getColor = (remaining: number) => {
    if (remaining === 2) return 'text-green-600';
    if (remaining === 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-bold text-gray-800">Daily Poke Limits</h3>
      </div>
      
      <div className="space-y-6">
        {/* Date */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Today's Date</p>
          <p className="text-lg font-semibold text-gray-800">{dailyLimits.date}</p>
        </div>
        
        {/* Pokes Sent */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Pokes Sent</span>
            </div>
            <span className={`font-bold ${getColor(dailyLimits.remainingSends)}`}>
              {2 - dailyLimits.remainingSends}/2
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(dailyLimits.remainingSends)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>1</span>
            <span>2</span>
          </div>
        </div>
        
        {/* Pokes Received */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">Pokes Received</span>
            </div>
            <span className={`font-bold ${getColor(dailyLimits.remainingReceives)}`}>
              {2 - dailyLimits.remainingReceives}/2
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(dailyLimits.remainingReceives)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>1</span>
            <span>2</span>
          </div>
        </div>
        
        {/* Reset Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Resets Daily</p>
              <p className="text-xs text-blue-600">Limits reset at 12:00 AM UTC</p>
            </div>
          </div>
        </div>
        
        {/* Rules */}
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1"></div>
            <span>Each poke earns <strong>50 points</strong> for both users</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1"></div>
            <span>Watch an ad before each poke</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1"></div>
            <span>You can only poke the same user once per day</span>
          </div>
        </div>
      </div>
    </div>
  );
};
