import React from 'react';
import { CheckCircle2, Dumbbell } from 'lucide-react';
import { formatDateDDMM } from '../../utils/nutrition';
import { getDefaultShiftForDate } from '../../utils/shift';

interface WorkoutHeaderBarProps {
  selectedDate: string;
  currentShift?: string;
  currentRoutineLabel: string;
  workoutConfirmed?: boolean;
  workoutConfirmToast: boolean;
  onConfirmWorkout: () => void;
  onDismissToast: () => void;
}

export const WorkoutHeaderBar: React.FC<WorkoutHeaderBarProps> = ({
  selectedDate,
  currentShift,
  currentRoutineLabel,
  workoutConfirmed,
  workoutConfirmToast,
  onConfirmWorkout,
  onDismissToast,
}) => {
  return (
    <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl ${
              workoutConfirmed
                ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {workoutConfirmed ? <CheckCircle2 size={20} /> : <Dumbbell size={20} />}
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100 flex items-center space-x-2">
              <span>{currentRoutineLabel}</span>
              {workoutConfirmed && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-semibold">
                  Confirmed ✓
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-500">
              Date: {formatDateDDMM(selectedDate)} • Shift:{' '}
              {currentShift || getDefaultShiftForDate(selectedDate)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirmWorkout}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition-all shadow-lg active:scale-95"
        >
          <CheckCircle2 size={16} />
          <span>
            {workoutConfirmed ? 'Update & Re-confirm Workout' : 'Confirm & Save Workout'}
          </span>
        </button>
      </div>

      {workoutConfirmToast && (
        <div className="p-2.5 bg-emerald-950/90 border border-emerald-700 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Workout confirmed and saved to Ledger for {formatDateDDMM(selectedDate)}!</span>
          </div>
          <button
            type="button"
            onClick={onDismissToast}
            className="text-emerald-400 hover:text-white cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
