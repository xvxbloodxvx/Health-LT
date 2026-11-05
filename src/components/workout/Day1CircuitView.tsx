import React from 'react';
import { Plus } from 'lucide-react';
import type { Benchmarks, DayLedgerEntry, RoutineExercise, BenchmarkSet } from '../../types';
import { ExerciseCard } from './ExerciseCard';

interface Day1CircuitViewProps {
  safeBenchmarks: Benchmarks;
  currentDay: DayLedgerEntry;
  routineExercises: RoutineExercise[];
  onUpdateExerciseSet: (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight_kg',
    value: number
  ) => void;
  onAutofillExercise: (exerciseId: string, defaultSets: BenchmarkSet[]) => void;
  onAutofillRoutineExercise: (ex: RoutineExercise) => void;
  onStartRestTimer: (seconds: number, label?: string) => void;
  onOpenAddExerciseModal: (routineId: string) => void;
  onOpenEditExerciseModal: (routineId: string, ex: RoutineExercise) => void;
  onDeleteExercise: (routineId: string, exerciseId: string) => void;
  onMoveExercise: (routineId: string, index: number, direction: 'up' | 'down') => void;
}

export const Day1CircuitView: React.FC<Day1CircuitViewProps> = ({
  safeBenchmarks,
  currentDay,
  routineExercises,
  onUpdateExerciseSet,
  onAutofillExercise,
  onAutofillRoutineExercise,
  onStartRestTimer,
  onOpenAddExerciseModal,
  onOpenEditExerciseModal,
  onDeleteExercise,
  onMoveExercise
}) => {
  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Day 1: Calisthenics Circuit (3 Rounds)</h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            50s Plank → 90s rest → 4 Pull-ups → 90s rest → 1-2 Chin-ups
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((round) => {
          const bench = safeBenchmarks.day_1.circuit[round - 1] || {
            plank_sec: 50,
            pullup_reps: 4,
            chinup_reps: 2,
            rest_sec: 90
          };
          const loggedPlank = currentDay.workouts?.[`circuit_r${round}`]?.[0]?.reps;
          const loggedPullup = currentDay.workouts?.[`circuit_pullup_r${round}`]?.[0]?.reps;
          const loggedChinup = currentDay.workouts?.[`circuit_chinup_r${round}`]?.[0]?.reps;

          return (
            <div
              key={round}
              className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="font-bold text-zinc-200">Round {round}</div>

              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Plank (sec)</span>
                  <input
                    type="number"
                    aria-label={`Round ${round} Plank Seconds`}
                    value={loggedPlank ?? bench.plank_sec}
                    onChange={(e) =>
                      onUpdateExerciseSet(
                        `circuit_r${round}`,
                        0,
                        'reps',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-11 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded px-1 py-0.5 text-center font-bold text-zinc-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 block">Pull-ups</span>
                  <input
                    type="number"
                    aria-label={`Round ${round} Pull-ups`}
                    value={loggedPullup ?? bench.pullup_reps}
                    onChange={(e) =>
                      onUpdateExerciseSet(
                        `circuit_pullup_r${round}`,
                        0,
                        'reps',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-9 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded px-1 py-0.5 text-center font-bold text-zinc-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 block">Chin-ups</span>
                  <input
                    type="number"
                    aria-label={`Round ${round} Chin-ups`}
                    value={loggedChinup ?? bench.chinup_reps}
                    onChange={(e) =>
                      onUpdateExerciseSet(
                        `circuit_chinup_r${round}`,
                        0,
                        'reps',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-9 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded px-1 py-0.5 text-center font-bold text-zinc-100 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onAutofillExercise(`circuit_r${round}`, [{ set: 1, reps: bench.plank_sec }]);
                    onAutofillExercise(`circuit_pullup_r${round}`, [
                      { set: 1, reps: bench.pullup_reps }
                    ]);
                    onAutofillExercise(`circuit_chinup_r${round}`, [
                      { set: 1, reps: bench.chinup_reps }
                    ]);
                  }}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] cursor-pointer"
                >
                  Autofill
                </button>
                <button
                  type="button"
                  onClick={() => onStartRestTimer(bench.rest_sec, `R${round} Rest`)}
                  className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-[11px] cursor-pointer"
                >
                  Rest ({bench.rest_sec}s)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Routine Exercises for Day 1 */}
      <div className="border-t border-zinc-800/80 pt-4 space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-300">Routine Exercises</span>
          <button
            type="button"
            onClick={() => onOpenAddExerciseModal('day_1')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] cursor-pointer transition-colors"
          >
            <Plus size={12} />
            <span>Add Exercise</span>
          </button>
        </div>

        {(routineExercises || []).map((ex, index) => (
          <ExerciseCard
            key={ex.id}
            routineId="day_1"
            exercise={ex}
            index={index}
            totalExercises={routineExercises.length}
            loggedSets={currentDay.workouts?.[ex.id]}
            onUpdateSet={onUpdateExerciseSet}
            onEditExercise={onOpenEditExerciseModal}
            onDeleteExercise={onDeleteExercise}
            onAutofillExercise={onAutofillRoutineExercise}
            onStartRestTimer={onStartRestTimer}
            onMoveExercise={onMoveExercise}
          />
        ))}
      </div>
    </div>
  );
};
