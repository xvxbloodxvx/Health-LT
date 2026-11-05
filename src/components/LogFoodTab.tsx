import React, { useState } from 'react';
import {
  Sparkles, RefreshCw, CheckCircle2, Pencil, Trash2, ShieldAlert,
  Layers, Sliders, Plus, ArrowDownToLine, Flame, Zap, RotateCcw,
  Search, Info, Check
} from 'lucide-react';
import type { MealItem, DayLedgerEntry, PantryItem } from '../types';
import {
  formatDateDDMM,
  calculateAtwaterCalories,
  getNetCarbStatus,
  getCalorieStatus,
  scalePantryItem
} from '../utils/nutrition';

interface LogFoodTabProps {
  selectedDate: string;
  currentDay: DayLedgerEntry;
  mealInput: { targetMeal: string; text: string };
  onMealInputChange: (updater: (prev: { targetMeal: string; text: string }) => { targetMeal: string; text: string }) => void;
  onMealTextChange: (text: string) => void;
  onParseMealInput: () => void;
  isLoading: boolean;
  autocompleteSuggestions: PantryItem[];
  onAddPantryItemToMeal: (item: PantryItem, grams?: number) => void;
  loggedFoodToast: {
    message: string;
    subtext: string;
    mealKey: string;
    item: MealItem;
  } | null;
  onDismissLoggedFoodToast: () => void;
  onOpenEditMealItem: (mealKey: string, item: MealItem) => void;
  onRecalculateDayNutrition: (updatedMeals: Record<string, MealItem[]>) => void;
  onUpdateCurrentDay: (field: keyof DayLedgerEntry, value: unknown) => void;
  onUpdateCurrentDayFields: (fields: Partial<DayLedgerEntry>) => void;
  pantry: PantryItem[];
}

export const LogFoodTab: React.FC<LogFoodTabProps> = ({
  selectedDate,
  currentDay,
  mealInput,
  onMealInputChange,
  onMealTextChange,
  onParseMealInput,
  isLoading,
  autocompleteSuggestions,
  onAddPantryItemToMeal,
  loggedFoodToast,
  onDismissLoggedFoodToast,
  onOpenEditMealItem,
  onRecalculateDayNutrition,
  onUpdateCurrentDay,
  onUpdateCurrentDayFields,
  pantry,
}) => {
  // Direct Quick Pantry Lookup state
  const [directSearchQuery, setDirectSearchQuery] = useState('');
  const [directPortionGrams, setDirectPortionGrams] = useState<number>(100);
  const [directToast, setDirectToast] = useState<string | null>(null);

  // Subtotal calculations from Meal items
  const mealKeys = ['meal_1', 'meal_2', 'meal_3'];
  let totalMealItemsCount = 0;
  let mealSumP = 0;
  let mealSumNC = 0;
  let mealSumFat = 0;
  let mealSumFib = 0;
  let mealSumCal = 0;
  let mealSumNa = 0;
  let mealSumK = 0;
  let mealSumMg = 0;
  let mealSumCa = 0;

  mealKeys.forEach((mk) => {
    const items = currentDay.meals?.[mk] || [];
    totalMealItemsCount += items.length;
    items.forEach((i) => {
      mealSumP += i.protein || 0;
      mealSumNC += i.net_carbs || 0;
      mealSumFat += i.fat || 0;
      mealSumFib += i.fiber || 0;
      mealSumCal += i.calories || 0;
      mealSumNa += i.sodium || 0;
      mealSumK += i.potassium || 0;
      mealSumMg += i.magnesium || 0;
      mealSumCa += i.calcium || 0;
    });
  });

  // Current mode: 'direct' (Option 1) vs 'meals' (Per-meal 1-3)
  const currentMode: 'meals' | 'direct' =
    currentDay.intake_mode || (totalMealItemsCount > 0 ? 'meals' : 'direct');

  // Direct Day Total Numerical Values
  const protein = Number(currentDay.protein || 0);
  const netCarbs = Number(currentDay.net_carbs || 0);
  const fiber = Number(currentDay.fiber || 0);
  const fat = Number(currentDay.fat || 0);
  const calories = Number(currentDay.calories || 0);
  const sodium = Number(currentDay.sodium || 0);
  const potassium = Number(currentDay.potassium || 0);
  const magnesium = Number(currentDay.magnesium || 0);
  const calcium = Number(currentDay.calcium || 0);

  // Direct Status Checks
  const carbStatus = getNetCarbStatus(netCarbs);
  const isCaloriesExceeded = calories > 1500;

  // Filtered Pantry for Direct Quick Adder
  const matchedPantryItems = directSearchQuery.trim()
    ? pantry.filter((item) =>
        item.name.toLowerCase().includes(directSearchQuery.trim().toLowerCase())
      ).slice(0, 4)
    : [];

  // Handlers for Direct Intake
  const setMode = (newMode: 'meals' | 'direct') => {
    onUpdateCurrentDay('intake_mode', newMode);
  };

  const handleUpdateDirectCalories = (valueStr: string) => {
    const val = parseFloat(valueStr) || 0;
    onUpdateCurrentDayFields({
      calories: Math.max(0, Number(val.toFixed(1))),
      intake_mode: 'direct'
    });
  };

  const handleUpdateDirectMacro = (
    field: 'protein' | 'net_carbs' | 'fiber' | 'fat',
    valueStr: string
  ) => {
    const val = parseFloat(valueStr) || 0;
    const sanitizedVal = Math.max(0, Number(val.toFixed(1)));

    onUpdateCurrentDayFields({
      [field]: sanitizedVal,
      intake_mode: 'direct'
    });
  };

  const handleUpdateElectrolyte = (
    field: 'sodium' | 'potassium' | 'magnesium' | 'calcium',
    valueStr: string
  ) => {
    const val = parseFloat(valueStr) || 0;
    onUpdateCurrentDayFields({
      [field]: Math.max(0, Number(val.toFixed(1))),
      intake_mode: 'direct'
    });
  };

  const handleImportFromMeals = () => {
    onUpdateCurrentDayFields({
      calories: Math.round(mealSumCal),
      protein: Number(mealSumP.toFixed(1)),
      net_carbs: Number(mealSumNC.toFixed(1)),
      fat: Number(mealSumFat.toFixed(1)),
      fiber: Number(mealSumFib.toFixed(1)),
      sodium: Math.round(mealSumNa),
      potassium: Math.round(mealSumK),
      magnesium: Math.round(mealSumMg),
      calcium: Math.round(mealSumCa),
      intake_mode: 'direct'
    });
    setDirectToast(`Imported ${totalMealItemsCount} meal items totaling ${mealSumCal} kcal into Direct Day Total.`);
    setTimeout(() => setDirectToast(null), 4500);
  };

  const handleClearDirectTotals = () => {
    if (window.confirm("Reset today's direct intake totals to zero?")) {
      onUpdateCurrentDayFields({
        calories: 0,
        protein: 0,
        net_carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        potassium: 0,
        magnesium: 0,
        calcium: 0,
        intake_mode: 'direct'
      });
    }
  };

  const handleAddPantryDirectly = (item: PantryItem, grams = 100) => {
    const scaled = scalePantryItem(item, grams);
    const updatedP = Number((protein + scaled.protein).toFixed(1));
    const updatedNC = Number((netCarbs + scaled.net_carbs).toFixed(1));
    const updatedFat = Number((fat + (scaled.fat || 0)).toFixed(1));
    const updatedFib = Number((fiber + (scaled.fiber || 0)).toFixed(1));
    const updatedNa = Math.round(sodium + (scaled.sodium || 0));
    const updatedK = Math.round(potassium + (scaled.potassium || 0));
    const updatedMg = Math.round(magnesium + (scaled.magnesium || 0));
    const updatedCa = Math.round(calcium + (scaled.calcium || 0));
    const updatedCal = Math.round(calories + scaled.calories);

    onUpdateCurrentDayFields({
      protein: updatedP,
      net_carbs: updatedNC,
      fat: updatedFat,
      fiber: updatedFib,
      sodium: updatedNa,
      potassium: updatedK,
      magnesium: updatedMg,
      calcium: updatedCa,
      calories: updatedCal,
      intake_mode: 'direct'
    });

    setDirectToast(`Added ${scaled.name} (+${scaled.calories} kcal, +${scaled.protein}g P, +${scaled.net_carbs}g NC) into Day Total.`);
    setDirectSearchQuery('');
    setTimeout(() => setDirectToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. INTAKE MODE SELECTOR BAR (Option 1 vs Per-Meal 1-3)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              currentMode === 'direct'
                ? 'bg-zinc-100 text-zinc-950 shadow-md ring-1 ring-white/20'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Sliders size={14} className={currentMode === 'direct' ? 'text-zinc-950' : 'text-zinc-400'} />
            <span>Direct Day Total (Option 1)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('meals')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              currentMode === 'meals'
                ? 'bg-zinc-100 text-zinc-950 shadow-md ring-1 ring-white/20'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Layers size={14} className={currentMode === 'meals' ? 'text-zinc-950' : 'text-zinc-400'} />
            <span>Per-Meal (Meal 1–3)</span>
            {totalMealItemsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                currentMode === 'meals' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-700 text-zinc-300'
              }`}>
                {totalMealItemsCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 flex items-center space-x-2 px-2 self-start sm:self-center">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Shift Cycle: <strong className="text-zinc-200">{formatDateDDMM(selectedDate)}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300 font-semibold">{currentDay.shift || 'AM Shift'}</span>
        </div>
      </div>

      {/* Direct Toast Notice */}
      {directToast && (
        <div className="p-3 bg-zinc-900 border border-emerald-500/60 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-300 shadow-md">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{directToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setDirectToast(null)}
            className="text-zinc-500 hover:text-white px-1.5 py-0.5 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. OPTION 1: DIRECT TOTAL INTAKE CONSOLE
      ───────────────────────────────────────────────────────────── */}
      {currentMode === 'direct' && (
        <div className="space-y-6">
          {/* Context Header & Fast Actions */}
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
                  <Zap size={16} className="text-amber-400" />
                  <span>Direct Total Intake Console</span>
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Input aggregate daily numbers directly. No meal separation required for your 12.5h shift.
                </p>
              </div>

              {/* Utility actions */}
              <div className="flex flex-wrap items-center gap-2">
                {totalMealItemsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleImportFromMeals}
                    title="Pull summed macros from Meal 1, 2, 3 into direct inputs"
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine size={13} />
                    <span>Import From Meals ({mealSumCal} kcal)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearDirectTotals}
                  title="Reset daily totals to zero"
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 border border-zinc-800 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {carbStatus === 'hard_alert' && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center space-x-2 text-xs font-mono text-rose-300">
                <ShieldAlert size={14} className="text-rose-400 shrink-0" />
                <span>
                  <strong>Hard Breach:</strong> Net Carbs ({netCarbs}g) exceed 50.0g hard limit. Ketosis severely compromised.
                </span>
              </div>
            )}
          </div>

          {/* Core Daily Intake Cards Grid (Calories + Macros) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. TOTAL CALORIES */}
            <div className={`p-4 rounded-2xl border transition-colors space-y-3 ${
              isCaloriesExceeded
                ? 'bg-rose-950/20 border-rose-800'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1.5 ${
                  isCaloriesExceeded ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  <Flame size={14} className={isCaloriesExceeded ? 'text-rose-400' : 'text-amber-400'} />
                  <span>Total Calories</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  1,300–1,500 kcal
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <input
                  type="number"
                  step="any"
                  min="0"
                  aria-label="Direct Total Calories"
                  value={calories || ''}
                  placeholder="0"
                  onChange={(e) => handleUpdateDirectCalories(e.target.value)}
                  className={`w-full bg-zinc-950 border rounded-xl px-3.5 py-2 text-xl font-bold font-mono text-zinc-100 focus:outline-none ${
                    isCaloriesExceeded
                      ? 'border-rose-700 focus:border-rose-500'
                      : 'border-zinc-800 focus:border-amber-500'
                  }`}
                />
                <span className="text-xs font-mono text-zinc-400">kcal</span>
              </div>

              {/* Status Badge */}
              <div className="text-[11px] font-mono">
                {isCaloriesExceeded ? (
                  <span className="text-rose-400 flex items-center space-x-1 font-bold">
                    <ShieldAlert size={12} />
                    <span>&gt; 1,500 Limit Flag</span>
                  </span>
                ) : calories >= 1300 && calories <= 1500 ? (
                  <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                    <Check size={12} />
                    <span>Target Baseline Met</span>
                  </span>
                ) : calories > 0 ? (
                  <span className="text-zinc-400">Standard Daily Total</span>
                ) : (
                  <span className="text-zinc-500">Input total calories</span>
                )}
              </div>
            </div>

            {/* 2. PROTEIN */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Protein
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Floor: 90g–110g+
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  aria-label="Direct Total Protein"
                  value={protein || ''}
                  placeholder="0.0"
                  onChange={(e) => handleUpdateDirectMacro('protein', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xl font-bold font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs font-mono text-zinc-400">g</span>
              </div>

              {/* Status Badge */}
              <div className="text-[11px] font-mono">
                {protein >= 90 ? (
                  <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                    <Check size={12} />
                    <span>Daily floor met ({protein}g)</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Info size={12} />
                    <span>Need {Math.round(90 - protein)}g to hit floor</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2. NET CARBS */}
            <div className={`p-4 rounded-2xl border transition-colors space-y-3 ${
              carbStatus === 'hard_alert'
                ? 'bg-rose-950/20 border-rose-800'
                : carbStatus === 'soft_warning'
                ? 'bg-amber-950/20 border-amber-800'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono uppercase tracking-wider font-bold ${
                  carbStatus === 'hard_alert' ? 'text-rose-400' : carbStatus === 'soft_warning' ? 'text-amber-400' : 'text-amber-300'
                }`}>
                  Net Carbs
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Ceiling: ≤ 30.0g
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  aria-label="Direct Total Net Carbs"
                  value={netCarbs || ''}
                  placeholder="0.0"
                  onChange={(e) => handleUpdateDirectMacro('net_carbs', e.target.value)}
                  className={`w-full bg-zinc-950 border rounded-xl px-3.5 py-2 text-xl font-bold font-mono text-zinc-100 focus:outline-none ${
                    carbStatus === 'hard_alert'
                      ? 'border-rose-700 focus:border-rose-500'
                      : carbStatus === 'soft_warning'
                      ? 'border-amber-700 focus:border-amber-500'
                      : 'border-zinc-800 focus:border-amber-500'
                  }`}
                />
                <span className="text-xs font-mono text-zinc-400">g</span>
              </div>

              {/* Status Badge */}
              <div className="text-[11px] font-mono">
                {carbStatus === 'normal' ? (
                  <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                    <Check size={12} />
                    <span>Safe Ketosis (≤ 30.0g)</span>
                  </span>
                ) : carbStatus === 'soft_warning' ? (
                  <span className="text-amber-400 flex items-center space-x-1 font-semibold">
                    <ShieldAlert size={12} />
                    <span>Soft Warning (30g–50g)</span>
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center space-x-1 font-bold">
                    <ShieldAlert size={12} />
                    <span>Hard Breach (&gt; 50.0g)</span>
                  </span>
                )}
              </div>
            </div>

            {/* 3. DIETARY FIBER (Motility / Psyllium target) */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                  Dietary Fiber
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Target: 35g–40g
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  aria-label="Direct Total Fiber"
                  value={fiber || ''}
                  placeholder="0.0"
                  onChange={(e) => handleUpdateDirectMacro('fiber', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xl font-bold font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
                <span className="text-xs font-mono text-zinc-400">g</span>
              </div>

              {/* Status Badge */}
              <div className="text-[11px] font-mono">
                {fiber >= 35 ? (
                  <span className="text-purple-300 flex items-center space-x-1 font-semibold">
                    <Check size={12} />
                    <span>Motility floor achieved ({fiber}g)</span>
                  </span>
                ) : (
                  <span className="text-zinc-500 flex items-center space-x-1">
                    <Info size={12} />
                    <span>Target 35g for psyllium motility</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4. TOTAL FATS */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Total Fats
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {Math.round(fat * 9)} kcal energy
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  aria-label="Direct Total Fat"
                  value={fat || ''}
                  placeholder="0.0"
                  onChange={(e) => handleUpdateDirectMacro('fat', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xl font-bold font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs font-mono text-zinc-400">g</span>
              </div>

              <div className="text-[11px] font-mono text-zinc-500">
                Atwater factor: 9 kcal per 1.0g
              </div>
            </div>
          </div>

          {/* Electrolytes & Shift Hydration Section */}
          <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="border-b border-zinc-800/80 pb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
                Electrolytes & Fluid Retention Floors
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block">
                Crucial for 12.5h shift fatigue and keto-adaptation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Sodium */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-blue-300 uppercase font-semibold">Sodium (Na)</span>
                  <span className="text-zinc-500">≥ 2,500mg</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    aria-label="Direct Total Sodium"
                    value={sodium || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateElectrolyte('sodium', e.target.value)}
                    className="w-full bg-transparent text-base font-bold font-mono text-zinc-100 outline-none"
                  />
                  <span className="text-[10px] font-mono text-zinc-500">mg</span>
                </div>
                <div className="text-[9px] font-mono">
                  {sodium >= 2500 ? (
                    <span className="text-emerald-400">✓ Target Met</span>
                  ) : (
                    <span className="text-zinc-500">Need {Math.round(2500 - sodium)}mg</span>
                  )}
                </div>
              </div>

              {/* Potassium */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-teal-300 uppercase font-semibold">Potassium (K)</span>
                  <span className="text-zinc-500">≥ 3,500mg</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    aria-label="Direct Total Potassium"
                    value={potassium || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateElectrolyte('potassium', e.target.value)}
                    className="w-full bg-transparent text-base font-bold font-mono text-zinc-100 outline-none"
                  />
                  <span className="text-[10px] font-mono text-zinc-500">mg</span>
                </div>
                <div className="text-[9px] font-mono">
                  {potassium >= 3500 ? (
                    <span className="text-emerald-400">✓ Target Met</span>
                  ) : (
                    <span className="text-zinc-500">Need {Math.round(3500 - potassium)}mg</span>
                  )}
                </div>
              </div>

              {/* Magnesium */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-violet-300 uppercase font-semibold">Magnesium (Mg)</span>
                  <span className="text-zinc-500">≥ 420mg</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    aria-label="Direct Total Magnesium"
                    value={magnesium || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateElectrolyte('magnesium', e.target.value)}
                    className="w-full bg-transparent text-base font-bold font-mono text-zinc-100 outline-none"
                  />
                  <span className="text-[10px] font-mono text-zinc-500">mg</span>
                </div>
                <div className="text-[9px] font-mono">
                  {magnesium >= 420 ? (
                    <span className="text-emerald-400">✓ Target Met</span>
                  ) : (
                    <span className="text-zinc-500">Need {Math.round(420 - magnesium)}mg</span>
                  )}
                </div>
              </div>

              {/* Calcium */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-300 uppercase font-semibold">Calcium (Ca)</span>
                  <span className="text-zinc-500">≥ 800mg</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    aria-label="Direct Total Calcium"
                    value={calcium || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateElectrolyte('calcium', e.target.value)}
                    className="w-full bg-transparent text-base font-bold font-mono text-zinc-100 outline-none"
                  />
                  <span className="text-[10px] font-mono text-zinc-500">mg</span>
                </div>
                <div className="text-[9px] font-mono">
                  {calcium >= 800 ? (
                    <span className="text-emerald-400">✓ Target Met</span>
                  ) : (
                    <span className="text-zinc-500">Need {Math.round(800 - calcium)}mg</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Pantry Item Quick-Adder to Day Totals */}
          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center space-x-1.5">
                <Search size={14} className="text-zinc-400" />
                <span>Quick Add From Verified HPB/USDA Pantry to Daily Totals</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Directly increments today's macros
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={directSearchQuery}
                placeholder="Type item from pantry (e.g. Chicken breast, Chia seeds, Roast chicken, Almonds)..."
                onChange={(e) => setDirectSearchQuery(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
              />
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-mono text-zinc-500">Grams:</span>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={directPortionGrams}
                  onChange={(e) => setDirectPortionGrams(parseInt(e.target.value, 10) || 100)}
                  className="w-20 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2.5 text-xs text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Matched Suggestions */}
            {matchedPantryItems.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 space-y-1.5 shadow-xl">
                <div className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 uppercase tracking-wider">
                  Select Pantry Item to add {directPortionGrams}g into Day Total:
                </div>
                {matchedPantryItems.map((item) => {
                  const factor = directPortionGrams / (item.base_grams || 100);
                  const pPreview = (item.protein * factor).toFixed(1);
                  const ncPreview = (item.net_carbs * factor).toFixed(1);
                  const calPreview = Math.round(item.calories * factor);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddPantryDirectly(item, directPortionGrams)}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-lg cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono transition-colors border border-transparent hover:border-zinc-800"
                    >
                      <div className="font-semibold text-zinc-200">
                        {item.name} ({directPortionGrams}g)
                      </div>
                      <div className="text-zinc-400 text-[11px] space-x-2 mt-0.5 sm:mt-0 flex items-center">
                        <span className="text-zinc-300 font-bold">{calPreview} kcal</span>
                        <span>•</span>
                        <span className="text-cyan-400">{pPreview}g P</span>
                        <span>•</span>
                        <span className="text-amber-400">{ncPreview}g NC</span>
                        <span className="text-xs text-emerald-400 font-bold ml-2 underline">
                          + Add To Day
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. PER-MEAL BREAKDOWN CONSOLE (Meal 1, 2, 3)
      ───────────────────────────────────────────────────────────── */}
      {currentMode === 'meals' && (
        <div className="space-y-6">
          {/* Meal Input Box with Autocomplete */}
          <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Meal Natural Language / Pantry Input
              </span>
              <div className="flex space-x-1">
                {['meal_1', 'meal_2', 'meal_3'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onMealInputChange((prev) => ({ ...prev, targetMeal: m }))}
                    className={`text-xs px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer ${
                      mealInput.targetMeal === m
                        ? 'bg-zinc-100 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={mealInput.text}
                aria-label="Meal item description"
                onChange={(e) => onMealTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onParseMealInput();
                }}
                placeholder="e.g. 1 bowl white rice, chicken breast, 2 slices toast, or type a pantry item..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
              />
              <button
                type="button"
                onClick={onParseMealInput}
                disabled={isLoading || !mealInput.text.trim()}
                className="px-5 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold disabled:bg-zinc-800 disabled:text-zinc-600 text-xs font-mono rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors shrink-0 shadow"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                <span>Log Item</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {autocompleteSuggestions.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 space-y-1 shadow-2xl">
                <div className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 uppercase tracking-widest">
                  Matched in Verified Pantry:
                </div>
                {autocompleteSuggestions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onAddPantryItemToMeal(item, 100)}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-lg cursor-pointer flex justify-between items-center text-xs font-mono"
                  >
                    <span className="font-medium text-zinc-200">{item.name}</span>
                    <span className="text-zinc-500">
                      {item.calories} kcal | {item.protein}g P | {item.net_carbs}g NC
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Verified Nutritional Feedback Card */}
          {loggedFoodToast && (
            <div className="p-3.5 bg-zinc-900 border border-emerald-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-lg">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 size={15} />
                    <span>{loggedFoodToast.message}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-semibold">
                    ✓ Verified Atwater
                  </span>
                </div>
                <div className="text-zinc-400 text-[11px]">{loggedFoodToast.subtext}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (loggedFoodToast.item && loggedFoodToast.mealKey) {
                      onOpenEditMealItem(loggedFoodToast.mealKey, loggedFoodToast.item);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1"
                >
                  <Pencil size={12} />
                  <span>Adjust / Edit</span>
                </button>
                <button
                  type="button"
                  onClick={onDismissLoggedFoodToast}
                  className="p-1 text-zinc-500 hover:text-white cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Hierarchical Meal Lists */}
          {mealKeys.map((mealKey) => {
            const items = currentDay.meals?.[mealKey] || [];
            const subtotalP = items.reduce((acc, i) => acc + (i.protein || 0), 0);
            const subtotalNC = items.reduce((acc, i) => acc + (i.net_carbs || 0), 0);
            const subtotalFat = items.reduce((acc, i) => acc + (i.fat || 0), 0);
            const subtotalFib = items.reduce((acc, i) => acc + (i.fiber || 0), 0);
            const subtotalCal = items.reduce((acc, i) => acc + (i.calories || 0), 0);
            const subtotalNa = items.reduce((acc, i) => acc + (i.sodium || 0), 0);
            const subtotalK = items.reduce((acc, i) => acc + (i.potassium || 0), 0);
            const subtotalMg = items.reduce((acc, i) => acc + (i.magnesium || 0), 0);
            const subtotalCa = items.reduce((acc, i) => acc + (i.calcium || 0), 0);
            const atwaterCal = calculateAtwaterCalories(subtotalP, subtotalNC, subtotalFat);
            const hasCalorieMismatch = items.length > 0 && Math.abs(subtotalCal - atwaterCal) > 15;

            return (
              <div
                key={mealKey}
                className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-bold">
                    {mealKey.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex flex-col sm:items-end gap-1 font-mono">
                    {hasCalorieMismatch && (
                      <button
                        type="button"
                        onClick={() => {
                          const existing = currentDay.meals?.[mealKey] || [];
                          const updated = existing.map((item) => ({
                            ...item,
                            calories: calculateAtwaterCalories(
                              item.protein || 0,
                              item.net_carbs || 0,
                              item.fat || 0
                            )
                          }));
                          const updatedMeals = {
                            ...(currentDay.meals || { meal_1: [], meal_2: [], meal_3: [] }),
                            [mealKey]: updated
                          };
                          onRecalculateDayNutrition(updatedMeals);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                        title="Recalculate calories strictly using Atwater formula (P*4 + NC*4 + F*9)"
                      >
                        Sync Calories to Atwater ({atwaterCal} kcal)
                      </button>
                    )}
                    {/* Macro Subtotals */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span
                        className={
                          subtotalCal > 1500 ? 'text-rose-400 font-bold' : 'text-zinc-100 font-bold'
                        }
                      >
                        {subtotalCal} kcal
                      </span>
                      <span>•</span>
                      <span className="text-cyan-400 font-semibold">{subtotalP.toFixed(1)}g P</span>
                      <span>•</span>
                      <span
                        className={
                          subtotalNC > 30
                            ? 'text-rose-400 font-bold'
                            : subtotalNC > 15
                            ? 'text-amber-400 font-bold'
                            : 'text-amber-300'
                        }
                      >
                        {subtotalNC.toFixed(1)}g NC
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{subtotalFat.toFixed(1)}g Fat</span>
                      <span>•</span>
                      <span className="text-purple-400 font-semibold">{subtotalFib.toFixed(1)}g Fib</span>
                    </div>

                    {/* Micronutrient / Electrolyte Subtotals */}
                    <div className="text-[10px] text-zinc-500 flex flex-wrap items-center gap-1.5">
                      <span className="text-blue-300">{Math.round(subtotalNa)}mg Na</span>
                      <span>•</span>
                      <span className="text-teal-300">{Math.round(subtotalK)}mg K</span>
                      <span>•</span>
                      <span className="text-violet-300">{Math.round(subtotalMg)}mg Mg</span>
                      <span>•</span>
                      <span className="text-zinc-400">{Math.round(subtotalCa)}mg Ca</span>
                    </div>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-600 font-mono">
                    No items logged in {mealKey.replace('_', ' ')}.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/40">
                    {items.map((item) => {
                      const itemAtwater = calculateAtwaterCalories(
                        item.protein || 0,
                        item.net_carbs || 0,
                        item.fat || 0
                      );
                      const itemMismatch = Math.abs((item.calories || 0) - itemAtwater) > 5;

                      return (
                        <div
                          key={item.id}
                          className="py-2.5 flex items-start justify-between text-xs hover:bg-zinc-900/30 px-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 font-medium text-zinc-200">
                              <span>{item.name}</span>
                              {item.sourceLabel && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {item.sourceLabel}
                                </span>
                              )}
                              {itemMismatch && (
                                <span
                                  className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1 rounded border border-amber-800/50"
                                  title={`Formula P*4 + NC*4 + F*9 = ${itemAtwater} kcal`}
                                >
                                  Atwater: {itemAtwater} kcal
                                </span>
                              )}
                            </div>
                            {/* Full Macronutrients */}
                            <div className="text-[10px] font-mono text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-zinc-200 font-semibold">{item.calories} kcal</span>
                              <span>•</span>
                              <span className="text-cyan-400 font-semibold">{item.protein}g P</span>
                              <span>•</span>
                              <span
                                className={
                                  item.net_carbs > 30
                                    ? 'text-rose-400 font-bold'
                                    : item.net_carbs > 15
                                    ? 'text-amber-400 font-bold'
                                    : 'text-amber-300'
                                }
                              >
                                {item.net_carbs}g NC
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">
                                {item.fat ?? 0}g Fat
                              </span>
                              <span>•</span>
                              <span className="text-purple-400 font-semibold">
                                {item.fiber ?? 0}g Fib
                              </span>
                            </div>
                            {/* Full Micronutrients & Electrolytes */}
                            <div className="text-[10px] font-mono text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-blue-300">{item.sodium || 0}mg Na</span>
                              <span>•</span>
                              <span className="text-teal-300">{item.potassium || 0}mg K</span>
                              <span>•</span>
                              <span className="text-violet-300">{item.magnesium || 0}mg Mg</span>
                              <span>•</span>
                              <span className="text-zinc-400">{item.calcium || 0}mg Ca</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0 ml-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => onOpenEditMealItem(mealKey, item)}
                              aria-label={`Edit ${item.name}`}
                              title="Edit nutritional information, macros and micros"
                              className="p-1.5 text-zinc-500 hover:text-zinc-200 cursor-pointer rounded hover:bg-zinc-800 transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = items.filter((x) => x.id !== item.id);
                                onRecalculateDayNutrition({
                                  ...(currentDay.meals || {}),
                                  [mealKey]: filtered
                                });
                              }}
                              aria-label={`Delete ${item.name}`}
                              className="p-1.5 text-zinc-600 hover:text-rose-400 cursor-pointer rounded hover:bg-zinc-800 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
