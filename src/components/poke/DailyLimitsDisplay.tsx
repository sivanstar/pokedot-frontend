import React from 'react';
import { Zap, Users, Calendar, AlertCircle } from 'lucide-react';

// This is a placeholder component that will be used later
export const DailyLimitsDisplay: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-blue-800">Daily Poke Limits</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="font-medium">You Can Send</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            2/2
          </div>
          <p className="text-xs text-gray-600 mt-1">pokes remaining</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="font-medium">You Can Receive</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            2/2
          </div>
          <p className="text-xs text-gray-600 mt-1">pokes remaining</p>
        </div>
      </div>
    </div>
  );
};
