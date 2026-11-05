import React from 'react';
import type {
  DayLedgerEntry,
  Benchmarks,
  RoutineExercise,
  BenchmarkSet
} from '../types';

import { WorkoutHeaderBar } from './workout/WorkoutHeaderBar';
import { RoutineSelector } from './workout/RoutineSelector';
import { Day1CircuitView } from './workout/Day1CircuitView';
import { RoutineExerciseListView } from './workout/RoutineExerciseListView';
import { Day4RestView } from './workout/Day4RestView';

interface WorkoutTabProps {
  selectedDate: string;
  currentDay: DayLedgerEntry;
  safeBenchmarks: Benchmarks;
  routineExercises: Record<string, RoutineExercise[]>;
  currentRoutineLabel: string;
  workoutConfirmToast: boolean;
  onConfirmWorkoutSelection: () => void;
  onDismissWorkoutConfirmToast: () => void;
  onUpdateCurrentDay: (field: keyof DayLedgerEntry, value: unknown) => void;
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
  onResetRoutineToDefaults: (routineId: string) => void;
  onMoveExercise: (routineId: string, index: number, direction: 'up' | 'down') => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  selectedDate,
  currentDay,
  safeBenchmarks,
  routineExercises,
  currentRoutineLabel,
  workoutConfirmToast,
  onConfirmWorkoutSelection,
  onDismissWorkoutConfirmToast,
  onUpdateCurrentDay,
  onUpdateExerciseSet,
  onAutofillExercise,
  onAutofillRoutineExercise,
  onStartRestTimer,
  onOpenAddExerciseModal,
  onOpenEditExerciseModal,
  onDeleteExercise,
  onResetRoutineToDefaults,
  onMoveExercise,
}) => {
  const activeRoutine = currentDay.active_routine || 'day_1';

  return (
    <div className="space-y-6">
      {/* Workout Confirmation & Action Bar */}
      <WorkoutHeaderBar
        selectedDate={selectedDate}
        currentShift={currentDay.shift}
        currentRoutineLabel={currentRoutineLabel}
        workoutConfirmed={currentDay.workout_confirmed}
        workoutConfirmToast={workoutConfirmToast}
        onConfirmWorkout={onConfirmWorkoutSelection}
        onDismissToast={onDismissWorkoutConfirmToast}
      />

      {/* Routine Selector Cards */}
      <RoutineSelector
        activeRoutine={activeRoutine}
        workoutConfirmed={currentDay.workout_confirmed}
        onSelectRoutine={(id) => onUpdateCurrentDay('active_routine', id)}
      />

      {/* Routine 1: Circuit Format */}
      {activeRoutine === 'day_1' && (
        <Day1CircuitView
          safeBenchmarks={safeBenchmarks}
          currentDay={currentDay}
          routineExercises={routineExercises.day_1 || []}
          onUpdateExerciseSet={onUpdateExerciseSet}
          onAutofillExercise={onAutofillExercise}
          onAutofillRoutineExercise={onAutofillRoutineExercise}
          onStartRestTimer={onStartRestTimer}
          onOpenAddExerciseModal={onOpenAddExerciseModal}
          onOpenEditExerciseModal={onOpenEditExerciseModal}
          onDeleteExercise={onDeleteExercise}
          onMoveExercise={onMoveExercise}
        />
      )}

      {/* Routine 2: Work Calisthenics & Strength */}
      {activeRoutine === 'day_2' && (
        <RoutineExerciseListView
          routineId="day_2"
          title="Day 2: Work Calisthenics & Strength"
          description="Edit actual reps completed per set, autofill, or start rest."
          exercises={routineExercises.day_2 || []}
          workouts={currentDay.workouts}
          onOpenAddExerciseModal={onOpenAddExerciseModal}
          onResetRoutineToDefaults={onResetRoutineToDefaults}
          onUpdateExerciseSet={onUpdateExerciseSet}
          onOpenEditExerciseModal={onOpenEditExerciseModal}
          onDeleteExercise={onDeleteExercise}
          onAutofillRoutineExercise={onAutofillRoutineExercise}
          onStartRestTimer={onStartRestTimer}
          onMoveExercise={onMoveExercise}
        />
      )}

      {/* Routine 3: Home 5kg Dumbbells & Core */}
      {activeRoutine === 'day_3' && (
        <RoutineExerciseListView
          routineId="day_3"
          title="Day 3: Home 5kg Dumbbells & Core"
          description="Customize weights and reps for every set, autofill, or start rest."
          exercises={routineExercises.day_3 || []}
          workouts={currentDay.workouts}
          onOpenAddExerciseModal={onOpenAddExerciseModal}
          onResetRoutineToDefaults={onResetRoutineToDefaults}
          onUpdateExerciseSet={onUpdateExerciseSet}
          onOpenEditExerciseModal={onOpenEditExerciseModal}
          onDeleteExercise={onDeleteExercise}
          onAutofillRoutineExercise={onAutofillRoutineExercise}
          onStartRestTimer={onStartRestTimer}
          onMoveExercise={onMoveExercise}
        />
      )}

      {/* Routine 4: Rest Day */}
      {activeRoutine === 'day_4' && (
        <Day4RestView
          workoutConfirmed={currentDay.workout_confirmed}
          recoveryExercises={routineExercises.day_4 || []}
          workouts={currentDay.workouts}
          onConfirmWorkout={onConfirmWorkoutSelection}
          onOpenAddExerciseModal={onOpenAddExerciseModal}
          onOpenEditExerciseModal={onOpenEditExerciseModal}
          onDeleteExercise={onDeleteExercise}
          onAutofillRoutineExercise={onAutofillRoutineExercise}
          onStartRestTimer={onStartRestTimer}
          onUpdateExerciseSet={onUpdateExerciseSet}
          onMoveExercise={onMoveExercise}
        />
      )}
    </div>
  );
};
