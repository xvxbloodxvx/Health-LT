import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  DayLedgerEntry,
  Benchmarks,
  RoutineExercise,
  BenchmarkSet
} from '../types';
import {
  INITIAL_BENCHMARKS,
  DEFAULT_ROUTINE_EXERCISES
} from '../data/seedData';
import { saveBenchmarksToFirestore } from '../firebase';

interface UseWorkoutProps {
  currentDay: DayLedgerEntry;
  updateCurrentDay: (field: keyof DayLedgerEntry, value: unknown) => void;
  startRestTimer: (seconds: number, label?: string) => void;
}

export function useWorkout({ currentDay, updateCurrentDay }: UseWorkoutProps) {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(() => {
    try {
      const saved = localStorage.getItem('routine_benchmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          day_1: parsed.day_1 && parsed.day_1.circuit ? parsed.day_1 : INITIAL_BENCHMARKS.day_1,
          day_2: parsed.day_2 && parsed.day_2.slow_squats ? parsed.day_2 : INITIAL_BENCHMARKS.day_2,
          day_3: parsed.day_3 && parsed.day_3.bed_goblet_squats ? parsed.day_3 : INITIAL_BENCHMARKS.day_3
        };
      }
      return INITIAL_BENCHMARKS;
    } catch {
      return INITIAL_BENCHMARKS;
    }
  });

  const [routineExercises, setRoutineExercises] = useState<Record<string, RoutineExercise[]>>(() => {
    try {
      const saved = localStorage.getItem('routine_exercises_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          day_1: Array.isArray(parsed.day_1) ? parsed.day_1 : DEFAULT_ROUTINE_EXERCISES.day_1,
          day_2: Array.isArray(parsed.day_2) ? parsed.day_2 : DEFAULT_ROUTINE_EXERCISES.day_2,
          day_3: Array.isArray(parsed.day_3) ? parsed.day_3 : DEFAULT_ROUTINE_EXERCISES.day_3,
          day_4: Array.isArray(parsed.day_4) ? parsed.day_4 : DEFAULT_ROUTINE_EXERCISES.day_4
        };
      }
      return DEFAULT_ROUTINE_EXERCISES;
    } catch {
      return DEFAULT_ROUTINE_EXERCISES;
    }
  });

  const [workoutConfirmToast, setWorkoutConfirmToast] = useState<boolean>(false);

  const [exerciseEditor, setExerciseEditor] = useState<{
    open: boolean;
    isEditing: boolean;
    routineId: string;
    exercise: RoutineExercise;
  }>({
    open: false,
    isEditing: false,
    routineId: 'day_2',
    exercise: {
      id: '',
      name: '',
      sets: 3,
      target_reps: 10,
      rest_sec: 90,
      has_weight: false,
      default_weight: 0
    }
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem('routine_benchmarks', JSON.stringify(benchmarks));
      if (!isInitialMount.current) {
        saveBenchmarksToFirestore(benchmarks);
      }
    } catch {
      // ignore
    }
    isInitialMount.current = false;
  }, [benchmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('routine_exercises_v1', JSON.stringify(routineExercises));
    } catch {
      // ignore
    }
  }, [routineExercises]);

  const safeBenchmarks = useMemo<Benchmarks>(
    () => ({
      day_1: benchmarks?.day_1 && benchmarks?.day_1?.circuit ? benchmarks.day_1 : INITIAL_BENCHMARKS.day_1,
      day_2: benchmarks?.day_2 && benchmarks?.day_2?.slow_squats ? benchmarks.day_2 : INITIAL_BENCHMARKS.day_2,
      day_3: benchmarks?.day_3 && benchmarks?.day_3?.bed_goblet_squats ? benchmarks.day_3 : INITIAL_BENCHMARKS.day_3
    }),
    [benchmarks]
  );

  const currentRoutineLabel = useMemo(() => {
    const routineId = currentDay.active_routine || 'day_1';
    switch (routineId) {
      case 'day_1':
        return 'Day 1 (Work Circuit)';
      case 'day_2':
        return 'Day 2 (Work Strength)';
      case 'day_3':
        return 'Day 3 (Home Dumbbell)';
      case 'day_4':
        return 'Day 4 (Rest)';
      default:
        return 'Day 1 (Work Circuit)';
    }
  }, [currentDay.active_routine]);

  const updateExerciseSet = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight_kg',
    value: number
  ) => {
    const currentWorkouts = { ...(currentDay.workouts || {}) };
    const sets = [...(currentWorkouts[exerciseId] || [])];
    if (!sets[setIndex]) {
      sets[setIndex] = { set: setIndex + 1, reps: 0 };
    }
    sets[setIndex] = { ...sets[setIndex], [field]: value };
    currentWorkouts[exerciseId] = sets;
    updateCurrentDay('workouts', currentWorkouts);
  };

  const autofillExercise = (exerciseId: string, defaultSets: BenchmarkSet[]) => {
    const currentWorkouts = { ...(currentDay.workouts || {}) };
    currentWorkouts[exerciseId] = defaultSets.map((s) => ({
      set: s.set,
      reps: s.reps,
      weight_kg: s.weight_kg
    }));
    updateCurrentDay('workouts', currentWorkouts);
  };

  const autofillRoutineExercise = (ex: RoutineExercise) => {
    const currentWorkouts = { ...(currentDay.workouts || {}) };
    const setsData = [];
    for (let s = 1; s <= ex.sets; s++) {
      setsData.push({
        set: s,
        reps: ex.target_reps,
        weight_kg: ex.has_weight ? ex.default_weight ?? 0 : undefined
      });
    }
    currentWorkouts[ex.id] = setsData;
    updateCurrentDay('workouts', currentWorkouts);
  };

  const confirmWorkoutSelection = () => {
    const routineId = currentDay.active_routine || 'day_1';
    let routineTitle = 'Day 1 (Work Circuit)';
    if (routineId === 'day_2') routineTitle = 'Day 2 (Work Strength)';
    if (routineId === 'day_3') routineTitle = 'Day 3 (Home Dumbbell)';
    if (routineId === 'day_4') routineTitle = 'Day 4 (Rest)';

    const currentWorkouts = { ...(currentDay.workouts || {}) };

    if (routineId === 'day_1') {
      [1, 2, 3].forEach((round) => {
        const benchCircuit = safeBenchmarks.day_1.circuit[round - 1];
        if (!currentWorkouts[`circuit_r${round}`]) {
          currentWorkouts[`circuit_r${round}`] = [{ set: 1, reps: benchCircuit.plank_sec }];
        }
        if (!currentWorkouts[`circuit_pullup_r${round}`]) {
          currentWorkouts[`circuit_pullup_r${round}`] = [{ set: 1, reps: benchCircuit.pullup_reps }];
        }
        if (!currentWorkouts[`circuit_chinup_r${round}`]) {
          currentWorkouts[`circuit_chinup_r${round}`] = [{ set: 1, reps: benchCircuit.chinup_reps }];
        }
      });
    }

    const currentRoutineList = routineExercises[routineId] || [];
    currentRoutineList.forEach((ex) => {
      if (!currentWorkouts[ex.id]) {
        currentWorkouts[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
          set: i + 1,
          reps: ex.target_reps,
          weight_kg: ex.has_weight ? ex.default_weight ?? 0 : undefined
        }));
      }
    });

    updateCurrentDay('active_routine', routineId);
    updateCurrentDay('workout_confirmed', true);
    updateCurrentDay('workout_name', routineTitle);
    updateCurrentDay('workouts', currentWorkouts);

    setWorkoutConfirmToast(true);
    setTimeout(() => setWorkoutConfirmToast(false), 3000);
  };

  const openAddExerciseModal = (routineId: string) => {
    setExerciseEditor({
      open: true,
      isEditing: false,
      routineId,
      exercise: {
        id: `ex_${Date.now()}`,
        name: '',
        sets: 3,
        target_reps: 10,
        rest_sec: 90,
        has_weight: routineId === 'day_3',
        default_weight: routineId === 'day_3' ? 5 : 0
      }
    });
  };

  const openEditExerciseModal = (routineId: string, ex: RoutineExercise) => {
    setExerciseEditor({
      open: true,
      isEditing: true,
      routineId,
      exercise: {
        id: ex.id,
        name: ex.name,
        sets: ex.sets || 3,
        target_reps: ex.target_reps || 10,
        rest_sec: ex.rest_sec ?? 90,
        has_weight: ex.has_weight ?? false,
        default_weight: ex.default_weight ?? 0
      }
    });
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseEditor.exercise.name.trim()) return;

    const sanitized: RoutineExercise = {
      id: exerciseEditor.exercise.id || `ex_${Date.now()}`,
      name: exerciseEditor.exercise.name.trim(),
      sets: Math.max(1, Math.min(10, Number(exerciseEditor.exercise.sets) || 3)),
      target_reps: Math.max(1, Number(exerciseEditor.exercise.target_reps) || 10),
      rest_sec: Math.max(0, Number(exerciseEditor.exercise.rest_sec) || 60),
      has_weight: Boolean(exerciseEditor.exercise.has_weight),
      default_weight: exerciseEditor.exercise.has_weight
        ? Number(exerciseEditor.exercise.default_weight) || 0
        : undefined
    };

    setRoutineExercises((prev) => {
      const list = prev[exerciseEditor.routineId] || [];
      const exists = list.some((x) => x.id === sanitized.id);
      const updatedList = exists
        ? list.map((x) => (x.id === sanitized.id ? sanitized : x))
        : [...list, sanitized];
      return {
        ...prev,
        [exerciseEditor.routineId]: updatedList
      };
    });

    setExerciseEditor((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteExercise = (routineId: string, exerciseId: string) => {
    setRoutineExercises((prev) => ({
      ...prev,
      [routineId]: (prev[routineId] || []).filter((x) => x.id !== exerciseId)
    }));
  };

  const resetRoutineToDefaults = (routineId: string) => {
    setRoutineExercises((prev) => ({
      ...prev,
      [routineId]: DEFAULT_ROUTINE_EXERCISES[routineId] || []
    }));
  };

  const handleMoveExercise = (routineId: string, index: number, direction: 'up' | 'down') => {
    setRoutineExercises((prev) => {
      const list = [...(prev[routineId] || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return {
        ...prev,
        [routineId]: list
      };
    });
  };

  return {
    benchmarks,
    setBenchmarks,
    safeBenchmarks,
    routineExercises,
    setRoutineExercises,
    currentRoutineLabel,
    workoutConfirmToast,
    setWorkoutConfirmToast,
    exerciseEditor,
    setExerciseEditor,
    updateExerciseSet,
    autofillExercise,
    autofillRoutineExercise,
    confirmWorkoutSelection,
    openAddExerciseModal,
    openEditExerciseModal,
    handleSaveExercise,
    handleDeleteExercise,
    resetRoutineToDefaults,
    handleMoveExercise
  };
}
