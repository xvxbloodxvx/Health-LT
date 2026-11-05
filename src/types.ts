// TypeScript interfaces and types for Health LT
// Diet, shift work, and calisthenics/strength tracking

export interface BenchmarkCircuitRound {
  round: number;
  plank_sec: number;
  pullup_reps: number;
  chinup_reps: number;
  rest_sec: number;
}

export interface BenchmarkSet {
  set: number;
  reps: number;
  rest_sec?: number;
  weight_kg?: number;
}

export interface Benchmarks {
  day_1: {
    circuit: BenchmarkCircuitRound[];
    inclined_chin_ups: BenchmarkSet[];
  };
  day_2: {
    slow_squats: BenchmarkSet[];
    incline_pushups: BenchmarkSet[];
    bench_dips: BenchmarkSet[];
    decline_situps: BenchmarkSet[];
  };
  day_3: {
    bed_goblet_squats: BenchmarkSet[];
    knee_raises: BenchmarkSet[];
    clamshell_side_raises: BenchmarkSet[];
    deadbugs: BenchmarkSet[];
  };
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  net_carbs: number;
  fiber?: number;
  fat?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  calcium?: number;
  source?: string;
  sourceLabel?: string;
  confidence_notes?: string;
}

export interface ExerciseSetLog {
  set: number;
  reps: number;
  weight_kg?: number;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: ExerciseSetLog[];
}

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  target_reps: number;
  rest_sec: number;
  has_weight?: boolean;
  default_weight?: number;
}

export interface DayLedgerEntry {
  weight_kg?: number | null;
  calories?: number;
  protein?: number;
  net_carbs?: number;
  fiber?: number;
  fat?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  calcium?: number;
  intake_mode?: 'meals' | 'direct';
  sleep_hours?: number | null;
  split_sleep?: number;
  waking_count?: number;
  bm_count?: number | null;
  shift?: string;
  notes?: string;
  active_routine?: string;
  workout_confirmed?: boolean;
  workout_name?: string;
  meals?: {
    meal_1: MealItem[];
    meal_2: MealItem[];
    meal_3: MealItem[];
    [key: string]: MealItem[];
  };
  workouts?: Record<string, ExerciseSetLog[]>;
}

export interface PantryItem {
  id: string;
  name: string;
  base_grams?: number;
  calories: number;
  protein: number;
  net_carbs: number;
  fiber?: number;
  fat?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  calcium?: number;
}

export type PantryItemForm = Omit<PantryItem, 'base_grams' | 'calories' | 'protein' | 'net_carbs' | 'fiber' | 'fat' | 'sodium' | 'potassium' | 'magnesium' | 'calcium'> & {
  base_grams?: number | string;
  calories?: number | string;
  protein?: number | string;
  net_carbs?: number | string;
  fiber?: number | string;
  fat?: number | string;
  sodium?: number | string;
  potassium?: number | string;
  magnesium?: number | string;
  calcium?: number | string;
};

export type ActiveTab = 'dashboard' | 'log' | 'workout' | 'pantry' | 'advisor' | 'settings';
export type DashboardTimeframe = '7' | '30';
export type LedgerTimeframe = '7' | '30' | 'all';
export type CloudSyncStatus = 'connected' | 'syncing' | 'offline';
