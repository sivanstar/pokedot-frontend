import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  description
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all hover:scale-105 active:scale-95">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <div className="text-white w-4 h-4 md:w-6 md:h-6">
            {icon}
          </div>
        </div>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">{value}</h3>
      <p className="text-xs md:text-sm text-gray-600 font-medium mt-1 truncate">{title}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1 hidden md:block">{description}</p>
      )}
    </div>
  );
};
