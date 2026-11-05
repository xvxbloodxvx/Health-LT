import {
  Benchmarks,
  RoutineExercise,
  DayLedgerEntry,
  PantryItem
} from '../types';

export const INITIAL_BENCHMARKS: Benchmarks = {
  day_1: {
    circuit: [
      { round: 1, plank_sec: 50, pullup_reps: 4, chinup_reps: 2, rest_sec: 90 },
      { round: 2, plank_sec: 50, pullup_reps: 4, chinup_reps: 1, rest_sec: 90 },
      { round: 3, plank_sec: 50, pullup_reps: 3, chinup_reps: 1, rest_sec: 90 },
    ],
    inclined_chin_ups: [
      { set: 1, reps: 5, rest_sec: 90 },
      { set: 2, reps: 5, rest_sec: 90 },
      { set: 3, reps: 5, rest_sec: 90 },
    ]
  },
  day_2: {
    slow_squats: [{ set: 1, reps: 20 }, { set: 2, reps: 20 }, { set: 3, reps: 20 }],
    incline_pushups: [{ set: 1, reps: 10 }, { set: 2, reps: 10 }, { set: 3, reps: 10 }],
    bench_dips: [{ set: 1, reps: 8 }, { set: 2, reps: 8 }, { set: 3, reps: 8 }],
    decline_situps: [{ set: 1, reps: 12 }, { set: 2, reps: 12 }, { set: 3, reps: 12 }]
  },
  day_3: {
    bed_goblet_squats: [{ set: 1, reps: 12, weight_kg: 5 }, { set: 2, reps: 12, weight_kg: 5 }, { set: 3, reps: 12, weight_kg: 5 }],
    knee_raises: [{ set: 1, reps: 15 }, { set: 2, reps: 15 }, { set: 3, reps: 15 }],
    clamshell_side_raises: [{ set: 1, reps: 12 }, { set: 2, reps: 12 }, { set: 3, reps: 12 }],
    deadbugs: [{ set: 1, reps: 12 }, { set: 2, reps: 12 }, { set: 3, reps: 12 }]
  }
};

export const DEFAULT_ROUTINE_EXERCISES: Record<string, RoutineExercise[]> = {
  day_1: [
    { id: "inclined_chin_ups", name: "Parallel Bar Inclined Chin-ups", sets: 3, target_reps: 5, rest_sec: 90, has_weight: false }
  ],
  day_2: [
    { id: "slow_squats", name: "Slow Bodyweight Squats", sets: 3, target_reps: 20, rest_sec: 90, has_weight: false },
    { id: "incline_pushups", name: "Bench Incline Push-ups", sets: 3, target_reps: 10, rest_sec: 90, has_weight: false },
    { id: "bench_dips", name: "Bench Dips", sets: 3, target_reps: 8, rest_sec: 90, has_weight: false },
    { id: "decline_situps", name: "Decline Bench Sit-ups", sets: 3, target_reps: 12, rest_sec: 90, has_weight: false }
  ],
  day_3: [
    { id: "bed_goblet_squats", name: "5kg DB Goblet Bed Squats", sets: 3, target_reps: 12, rest_sec: 90, has_weight: true, default_weight: 5 },
    { id: "knee_raises", name: "Alternating Knee Raises (1-2s hold)", sets: 3, target_reps: 15, rest_sec: 60, has_weight: false },
    { id: "clamshell_side_raises", name: "Clamshell + Side Leg Raise Superset", sets: 3, target_reps: 12, rest_sec: 60, has_weight: false },
    { id: "deadbugs", name: "Deadbugs", sets: 3, target_reps: 12, rest_sec: 90, has_weight: false }
  ],
  day_4: []
};

// Historical ledger strictly matching official roster (31 August 2026 + 14 Nov swap):
// October: PM Work / Rest / Standby cycle as in roster
// November 01: Rest (89.15kg), November 02: Standby (89.15kg, 0 kcal initial)
export const SEED_LEDGER: Record<string, DayLedgerEntry> = {
  "2026-08-20": { weight_kg: 99.00, notes: "Baseline Anchor", shift: "Rest" },
  "2026-10-11": { weight_kg: 91.85, calories: 1298, protein: 147.1, net_carbs: 15.6, fiber: 36.0, sodium: 2400, potassium: 3100, magnesium: 420, sleep_hours: 5.1, waking_count: 2, bm_count: 2, shift: "PM Work" },
  "2026-10-12": { weight_kg: 90.85, calories: 1919, protein: 178.8, net_carbs: 35.1, fiber: 38.0, sodium: 2600, potassium: 3300, magnesium: 430, sleep_hours: 5.8, waking_count: 1, bm_count: 0, shift: "Rest" },
  "2026-10-13": { weight_kg: 91.95, calories: 1347, protein: 167.6, net_carbs: 27.0, fiber: 35.0, sodium: 2300, potassium: 3200, magnesium: 410, sleep_hours: 5.8, waking_count: 1, bm_count: 0, shift: "Standby" },
  "2026-10-14": { weight_kg: 91.45, calories: 1437, protein: 93.0,  net_carbs: 22.8, fiber: 37.0, sodium: 2500, potassium: 3000, magnesium: 400, sleep_hours: 5.5, waking_count: 2, bm_count: 1, shift: "PM Work" },
  "2026-10-15": { weight_kg: 91.15, calories: 1403, protein: 90.2,  net_carbs: 24.6, fiber: 36.0, sodium: 2200, potassium: 2900, magnesium: 415, sleep_hours: 4.0, waking_count: 1, bm_count: 2, shift: "PM Work" },
  "2026-10-16": { weight_kg: 90.60, calories: 1475, protein: 164.6, net_carbs: 29.4, fiber: 39.0, sodium: 2700, potassium: 3400, magnesium: 435, sleep_hours: 9.3, waking_count: 2, bm_count: 1, shift: "Rest" },
  "2026-10-17": { weight_kg: 90.40, calories: 1302, protein: 145.3, net_carbs: 20.4, fiber: 34.0, sodium: 2100, potassium: 3100, magnesium: 405, sleep_hours: 7.75, waking_count: 0, bm_count: 1, shift: "Standby" },
  "2026-10-18": { weight_kg: 90.15, calories: 1480, protein: 115.2, net_carbs: 45.3, fiber: 38.0, sodium: 2450, potassium: 3050, magnesium: 410, sleep_hours: 4.6, waking_count: 0, bm_count: 1, shift: "PM Work" },
  "2026-10-19": { weight_kg: 89.85, calories: 1407, protein: 153.1, net_carbs: 30.7, fiber: 36.5, sodium: 2550, potassium: 3250, magnesium: 425, sleep_hours: 6.0, waking_count: 2, bm_count: 1, shift: "PM Work" },
  "2026-10-20": { weight_kg: 89.60, calories: 1441, protein: 147.8, net_carbs: 26.5, fiber: 35.0, sodium: 2400, potassium: 3300, magnesium: 420, sleep_hours: 5.0, waking_count: 1, bm_count: 1, shift: "Rest" },
  "2026-10-21": { weight_kg: 89.50, calories: 1498, protein: 152.8, net_carbs: 33.0, fiber: 37.0, sodium: 2650, potassium: 3150, magnesium: 430, sleep_hours: 6.0, waking_count: 0, bm_count: 0, shift: "Standby" },
  "2026-10-22": { weight_kg: 89.90, calories: 1385, protein: 105.4, net_carbs: 30.2, fiber: 36.0, sodium: 2300, potassium: 2950, magnesium: 415, sleep_hours: 4.75, waking_count: 1, bm_count: 1, shift: "PM Work" },
  "2026-10-23": { weight_kg: 89.35, calories: 1434, protein: 107.1, net_carbs: 27.0, fiber: 35.5, sodium: 2400, potassium: 3000, magnesium: 410, sleep_hours: 6.0, waking_count: 0, bm_count: 1, shift: "PM Work" },
  "2026-10-24": { weight_kg: 89.20, calories: 1499, protein: 154.0, net_carbs: 29.3, fiber: 38.0, sodium: 2550, potassium: 3350, magnesium: 425, sleep_hours: 9.0, waking_count: 2, bm_count: 2, shift: "Rest" },
  "2026-10-25": { weight_kg: 89.45, calories: 1476, protein: 118.1, net_carbs: 35.5, fiber: 38.4, sodium: 2562, potassium: 2950, magnesium: 425, sleep_hours: 6.2, waking_count: 0, bm_count: 1, shift: "Standby" },
  "2026-10-26": { weight_kg: 89.45, calories: 1530, protein: 152.4, net_carbs: 29.4, fiber: 32.3, sodium: 2858, potassium: 3405, magnesium: 421, sleep_hours: 6.5, waking_count: 0, bm_count: 1, shift: "PM Work" },
  "2026-10-27": { weight_kg: 89.20, calories: 1110, protein: 96.8,  net_carbs: 34.5, fiber: 40.2, sodium: 1548, potassium: 2940, magnesium: 438, sleep_hours: 7.0, waking_count: 0, bm_count: 2, shift: "PM Work" },
  "2026-10-28": { weight_kg: 88.55, calories: 1641, protein: 159.6, net_carbs: 40.5, fiber: 36.0, sodium: 2600, potassium: 3200, magnesium: 420, sleep_hours: 5.25, waking_count: 1, bm_count: 2, shift: "Rest" },
  "2026-10-29": { weight_kg: 88.90, calories: 1513, protein: 160.6, net_carbs: 41.0, fiber: 38.4, sodium: 2478, potassium: 3427, magnesium: 519, sleep_hours: 7.38, waking_count: 3, bm_count: 2, shift: "Standby" },
  "2026-10-30": { weight_kg: 89.30, calories: 1395, protein: 146.6, net_carbs: 34.7, fiber: 37.0, sodium: 2350, potassium: 3100, magnesium: 415, sleep_hours: 5.58, waking_count: 0, bm_count: 2, shift: "PM Work" },
  "2026-10-31": { weight_kg: 88.90, calories: 1299, protein: 108.1, net_carbs: 27.1, fiber: 35.0, sodium: 2200, potassium: 2900, magnesium: 410, sleep_hours: 5.08, waking_count: 2, bm_count: 1, shift: "PM Work" },
  "2026-11-01": { weight_kg: 89.15, calories: 2098, protein: 95.2,  net_carbs: 44.2, fiber: 38.0, sodium: 2700, potassium: 3150, magnesium: 430, sleep_hours: 9.75, waking_count: 0, bm_count: 1, shift: "Rest" },
  "2026-11-02": { weight_kg: 89.15, calories: 0, protein: 0, net_carbs: 0, fiber: 0, fat: 0, sodium: 0, potassium: 0, magnesium: 0, calcium: 0, sleep_hours: 6.5, waking_count: 1, bm_count: 1, shift: "Standby", meals: { meal_1: [], meal_2: [], meal_3: [] } }
};

export const DEFAULT_PANTRY_ITEMS: PantryItem[] = [
  { id: '1', name: 'Pasture Eggs (Large)', base_grams: 100, calories: 143, protein: 12.6, net_carbs: 0.7, fiber: 0, fat: 9.5, sodium: 142, potassium: 138, magnesium: 12 },
  { id: '2', name: 'Grass-fed Butter', base_grams: 100, calories: 717, protein: 0.9, net_carbs: 0.1, fiber: 0, fat: 81.1, sodium: 11, potassium: 24, magnesium: 2 },
  { id: '3', name: 'Wild Atlantic Salmon', base_grams: 100, calories: 208, protein: 20.4, net_carbs: 0, fiber: 0, fat: 13.4, sodium: 59, potassium: 490, magnesium: 29 },
  { id: '4', name: 'Raw Hass Avocado', base_grams: 100, calories: 160, protein: 2.0, net_carbs: 1.8, fiber: 6.7, fat: 14.7, sodium: 7, potassium: 485, magnesium: 29 },
  { id: '5', name: 'Organic Baby Spinach', base_grams: 100, calories: 23, protein: 2.9, net_carbs: 1.4, fiber: 2.2, fat: 0.4, sodium: 79, potassium: 558, magnesium: 79 },
  { id: '6', name: 'Whey Protein Isolate', base_grams: 100, calories: 375, protein: 87.5, net_carbs: 2.5, fiber: 0, fat: 1.2, sodium: 180, potassium: 450, magnesium: 65 }
];
