import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import type { RoutineExercise, ExerciseSetLog } from '../../types';
import { ExerciseCard } from './ExerciseCard';

interface RoutineExerciseListViewProps {
  routineId: string;
  title: string;
  description: string;
  exercises: RoutineExercise[];
  workouts?: Record<string, ExerciseSetLog[]>;
  onOpenAddExerciseModal: (routineId: string) => void;
  onResetRoutineToDefaults: (routineId: string) => void;
  onUpdateExerciseSet: (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight_kg',
    value: number
  ) => void;
  onOpenEditExerciseModal: (routineId: string, ex: RoutineExercise) => void;
  onDeleteExercise: (routineId: string, exerciseId: string) => void;
  onAutofillRoutineExercise: (ex: RoutineExercise) => void;
  onStartRestTimer: (seconds: number, label?: string) => void;
  onMoveExercise: (routineId: string, index: number, direction: 'up' | 'down') => void;
}

export const RoutineExerciseListView: React.FC<RoutineExerciseListViewProps> = ({
  routineId,
  title,
  description,
  exercises,
  workouts,
  onOpenAddExerciseModal,
  onResetRoutineToDefaults,
  onUpdateExerciseSet,
  onOpenEditExerciseModal,
  onDeleteExercise,
  onAutofillRoutineExercise,
  onStartRestTimer,
  onMoveExercise
}) => {
  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-4 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onOpenAddExerciseModal(routineId)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span>Add Exercise</span>
          </button>
          <button
            type="button"
            onClick={() => onResetRoutineToDefaults(routineId)}
            title="Reset Routine to Default Exercises"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-mono cursor-pointer transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {!exercises || exercises.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 bg-zinc-950/40 rounded-xl border border-zinc-800">
            No exercises in this routine. Click &quot;+ Add Exercise&quot; to add one.
          </div>
        ) : (
          exercises.map((ex, index) => (
            <ExerciseCard
              key={ex.id}
              routineId={routineId}
              exercise={ex}
              index={index}
              totalExercises={exercises.length}
              loggedSets={workouts?.[ex.id]}
              onUpdateSet={onUpdateExerciseSet}
              onEditExercise={onOpenEditExerciseModal}
              onDeleteExercise={onDeleteExercise}
              onAutofillExercise={onAutofillRoutineExercise}
              onStartRestTimer={onStartRestTimer}
              onMoveExercise={onMoveExercise}
            />
          ))
        )}
      </div>
    </div>
  );
};
