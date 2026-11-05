import React from 'react';
import { Activity, Dumbbell, Utensils, Database, Bot, Settings } from 'lucide-react';

export type AppTab = 'dashboard' | 'log' | 'workout' | 'pantry' | 'advisor' | 'settings';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
    { id: 'log' as const, label: 'Log Food', icon: Utensils },
    { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
    { id: 'pantry' as const, label: 'Pantry', icon: Database },
    { id: 'advisor' as const, label: 'Advisor', icon: Bot },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-800 px-4 py-2 pb-safe">
      <div className="max-w-md mx-auto flex justify-between items-center text-[10px] font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isSelected ? 'text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={18} strokeWidth={isSelected ? 2.5 : 1.8} />
              <span className="mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
