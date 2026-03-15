import React, { lazy, Suspense } from 'react';
import { Loader } from 'lucide-react';

// Lazy load the actual PokeButton
const PokeButtonComponent = lazy(() => import('./PokeButton').then(module => ({ default: module.PokeButton })));

interface LazyPokeButtonProps {
  userId: string;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  onPokeSuccess?: (pointsEarned: number) => void;
  onPokeError?: (error: any) => void;
}

export const LazyPokeButton: React.FC<LazyPokeButtonProps> = (props) => {
  return (
    <Suspense fallback={
      <button className="px-4 py-2 bg-gray-200 rounded-lg flex items-center justify-center">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="ml-2">Loading...</span>
      </button>
    }>
      <PokeButtonComponent {...props} />
    </Suspense>
  );
};
