import React from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { RoutineExercise, ExerciseSetLog } from '../../types';

interface ExerciseCardProps {
  routineId: string;
  exercise: RoutineExercise;
  index: number;
  totalExercises: number;
  loggedSets?: ExerciseSetLog[];
  onUpdateSet: (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight_kg',
    value: number
  ) => void;
  onEditExercise: (routineId: string, ex: RoutineExercise) => void;
  onDeleteExercise: (routineId: string, exerciseId: string) => void;
  onAutofillExercise: (ex: RoutineExercise) => void;
  onStartRestTimer: (seconds: number, label?: string) => void;
  onMoveExercise: (routineId: string, index: number, direction: 'up' | 'down') => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  routineId,
  exercise,
  index,
  totalExercises,
  loggedSets,
  onUpdateSet,
  onEditExercise,
  onDeleteExercise,
  onAutofillExercise,
  onStartRestTimer,
  onMoveExercise
}) => {
  return (
    <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex flex-col space-y-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveExercise(routineId, index, 'up')}
              title="Move Exercise Up"
              aria-label={`Move ${exercise.name} up`}
              className="p-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-400 hover:text-white rounded text-[10px] cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp size={11} />
            </button>
            <button
              type="button"
              disabled={index === totalExercises - 1}
              onClick={() => onMoveExercise(routineId, index, 'down')}
              title="Move Exercise Down"
              aria-label={`Move ${exercise.name} down`}
              className="p-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-400 hover:text-white rounded text-[10px] cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown size={11} />
            </button>
          </div>
          <div>
            <div className="font-semibold text-zinc-200">
              <span className="text-zinc-500 font-mono text-[11px] mr-1.5">#{index + 1}</span>
              {exercise.name}
            </div>
            <div className="text-[10px] text-zinc-500">
              Benchmark: {exercise.sets} sets × {exercise.target_reps} reps{' '}
              {exercise.has_weight ? `(${exercise.default_weight ?? 0}kg)` : ''} • {exercise.rest_sec}s rest
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => onEditExercise(routineId, exercise)}
            title="Edit Exercise"
            className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-[11px] cursor-pointer transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteExercise(routineId, exercise.id)}
            title="Delete Exercise"
            className="p-1.5 bg-zinc-800/80 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-400 rounded text-[11px] cursor-pointer transition-colors"
          >
            <Trash2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => onAutofillExercise(exercise)}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] cursor-pointer"
          >
            Autofill
          </button>
          <button
            type="button"
            onClick={() => onStartRestTimer(exercise.rest_sec, exercise.name)}
            className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-[11px] cursor-pointer hover:bg-emerald-900"
          >
            Rest ({exercise.rest_sec}s)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: exercise.sets }, (_, i) => i + 1).map((s) => {
          const logged = loggedSets?.[s - 1];
          return (
            <div
              key={s}
              className="bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800 text-center"
            >
              <span className="text-[10px] text-zinc-500 block">Set {s}</span>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {exercise.has_weight && (
                  <div className="flex items-center">
                    <input
                      type="number"
                      aria-label={`${exercise.name} Set ${s} Weight`}
                      value={logged?.weight_kg ?? exercise.default_weight ?? 0}
                      onChange={(e) =>
                        onUpdateSet(
                          exercise.id,
                          s - 1,
                          'weight_kg',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-8 sm:w-9 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded px-0.5 py-0.5 text-center font-bold text-zinc-100 text-[11px] outline-none"
                    />
                    <span className="text-[9px] text-zinc-500 ml-0.5">kg</span>
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="number"
                    aria-label={`${exercise.name} Set ${s} Reps`}
                    value={logged?.reps ?? exercise.target_reps}
                    onChange={(e) =>
                      onUpdateSet(
                        exercise.id,
                        s - 1,
                        'reps',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-8 sm:w-9 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded px-0.5 py-0.5 text-center font-bold text-zinc-100 text-[11px] outline-none"
                  />
                  <span className="text-[9px] text-zinc-500 ml-0.5">r</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
