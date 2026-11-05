import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-18 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-xs px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-xl border border-amber-400">
      <WifiOff className="w-3.5 h-3.5 text-zinc-950" />
      <span>Offline Mode — Running on local cached database</span>
    </div>
  );
};
