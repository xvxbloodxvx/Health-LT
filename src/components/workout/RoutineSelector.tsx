import React from 'react';

interface RoutineSelectorProps {
  activeRoutine: string;
  workoutConfirmed?: boolean;
  onSelectRoutine: (routineId: string) => void;
}

export const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  activeRoutine,
  workoutConfirmed,
  onSelectRoutine
}) => {
  const routines = [
    { id: 'day_1', label: 'Day 1 (Work Circuit)' },
    { id: 'day_2', label: 'Day 2 (Work Strength)' },
    { id: 'day_3', label: 'Day 3 (Home Dumbbell)' },
    { id: 'day_4', label: 'Day 4 (Rest)' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {routines.map((rt) => {
        const isSelected = (activeRoutine || 'day_1') === rt.id;
        return (
          <button
            key={rt.id}
            type="button"
            onClick={() => onSelectRoutine(rt.id)}
            className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer ${
              isSelected
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100 shadow-md'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex justify-between items-center">
              <span>Cycle Routine</span>
              {workoutConfirmed && isSelected && (
                <span className="text-emerald-600 font-bold">✓</span>
              )}
            </div>
            <div className="text-xs font-semibold mt-0.5">{rt.label}</div>
          </button>
        );
      })}
    </div>
  );
};
