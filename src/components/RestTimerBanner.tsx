import React from 'react';
import { Clock } from 'lucide-react';

interface RestTimerBannerProps {
  active: boolean;
  secondsLeft: number;
  label: string;
  onDismiss: () => void;
}

export const RestTimerBanner: React.FC<RestTimerBannerProps> = ({
  active,
  secondsLeft,
  label,
  onDismiss
}) => {
  if (!active) return null;

  return (
    <div className="sticky top-14 z-30 bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-2 flex items-center justify-between animate-pulse">
      <div className="flex items-center space-x-2 text-emerald-300">
        <Clock size={16} />
        <span className="text-xs font-mono font-medium">
          {label}: {secondsLeft}s remaining
        </span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs text-emerald-400 hover:text-emerald-200 font-mono cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
};
