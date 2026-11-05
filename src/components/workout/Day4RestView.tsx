import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import type { RoutineExercise, ExerciseSetLog } from '../../types';
import { ExerciseCard } from './ExerciseCard';

interface Day4RestViewProps {
  workoutConfirmed?: boolean;
  recoveryExercises: RoutineExercise[];
  workouts?: Record<string, ExerciseSetLog[]>;
  onConfirmWorkout: () => void;
  onOpenAddExerciseModal: (routineId: string) => void;
  onOpenEditExerciseModal: (routineId: string, ex: RoutineExercise) => void;
  onDeleteExercise: (routineId: string, exerciseId: string) => void;
  onAutofillRoutineExercise: (ex: RoutineExercise) => void;
  onStartRestTimer: (seconds: number, label?: string) => void;
  onUpdateExerciseSet: (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight_kg',
    value: number
  ) => void;
  onMoveExercise: (routineId: string, index: number, direction: 'up' | 'down') => void;
}

export const Day4RestView: React.FC<Day4RestViewProps> = ({
  workoutConfirmed,
  recoveryExercises,
  workouts,
  onConfirmWorkout,
  onOpenAddExerciseModal,
  onOpenEditExerciseModal,
  onDeleteExercise,
  onAutofillRoutineExercise,
  onStartRestTimer,
  onUpdateExerciseSet,
  onMoveExercise
}) => {
  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6 space-y-4 font-mono">
      <div className="text-center space-y-2">
        <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
        <h3 className="text-base font-bold text-zinc-100">Rest & Recovery Day</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Focus on full electrolyte rehydration (Sodium &gt;= 2,500mg, Potassium &gt;= 3,500mg) and
          deep restorative sleep.
        </p>
      </div>

      <div className="flex justify-center space-x-2 pt-1">
        <button
          type="button"
          onClick={onConfirmWorkout}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono cursor-pointer transition-colors shadow-sm"
        >
          {workoutConfirmed
            ? 'Rest Day Confirmed in Ledger ✓'
            : 'Confirm Rest Day in Ledger'}
        </button>
        <button
          type="button"
          onClick={() => onOpenAddExerciseModal('day_4')}
          className="flex items-center space-x-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-mono cursor-pointer transition-colors"
        >
          <Plus size={13} />
          <span>Add Recovery Exercise</span>
        </button>
      </div>

      {recoveryExercises && recoveryExercises.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-zinc-800/80 text-xs">
          <span className="text-xs font-semibold text-zinc-300 block text-left">
            Recovery Exercises
          </span>
          {recoveryExercises.map((ex, index) => (
            <ExerciseCard
              key={ex.id}
              routineId="day_4"
              exercise={ex}
              index={index}
              totalExercises={recoveryExercises.length}
              loggedSets={workouts?.[ex.id]}
              onUpdateSet={onUpdateExerciseSet}
              onEditExercise={onOpenEditExerciseModal}
              onDeleteExercise={onDeleteExercise}
              onAutofillExercise={onAutofillRoutineExercise}
              onStartRestTimer={onStartRestTimer}
              onMoveExercise={onMoveExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
};
