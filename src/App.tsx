import React, { useState, useEffect } from 'react';

// Hooks
import { useLedger } from './hooks/useLedger';
import { useRestTimer } from './hooks/useRestTimer';
import { usePantry } from './hooks/usePantry';
import { useNutrition } from './hooks/useNutrition';
import { useWorkout } from './hooks/useWorkout';
import { useAdvisor } from './hooks/useAdvisor';

// Components
import { HeaderNav } from './components/HeaderNav';
import { VitalHUD } from './components/VitalHUD';
import { RestTimerBanner } from './components/RestTimerBanner';
import { BottomNav, AppTab } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { LogFoodTab } from './components/LogFoodTab';
import { WorkoutTab } from './components/WorkoutTab';
import { PantryTab } from './components/PantryTab';
import { AdvisorTab } from './components/AdvisorTab';
import { SettingsTab } from './components/SettingsTab';
import { MealItemEditorModal } from './components/MealItemEditorModal';
import { PantryItemModal } from './components/PantryItemModal';
import { ExerciseEditorModal } from './components/ExerciseEditorModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Re-export types and seed data for backwards compatibility
export * from './types';
export * from './data/seedData';

export default function HealthApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // API Key for optional Gemini direct OCR
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      localStorage.getItem('gemini_api_key') ||
      (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
      ''
    );
  });

  useEffect(() => {
    try {
      localStorage.setItem('gemini_api_key', apiKey);
    } catch {
      // ignore
    }
  }, [apiKey]);

  // Domain Hooks (Defaults dynamically to today's date, keeping seed history intact)
  const ledgerHook = useLedger();
  const timerHook = useRestTimer();
  const pantryHook = usePantry();

  const nutritionHook = useNutrition({
    currentDay: ledgerHook.currentDay,
    updateCurrentDay: ledgerHook.updateCurrentDay,
    updateCurrentDayFields: ledgerHook.updateCurrentDayFields,
    pantry: pantryHook.pantry
  });

  const workoutHook = useWorkout({
    currentDay: ledgerHook.currentDay,
    updateCurrentDay: ledgerHook.updateCurrentDay,
    startRestTimer: timerHook.startRestTimer
  });

  const advisorHook = useAdvisor({
    currentDay: ledgerHook.currentDay,
    selectedDate: ledgerHook.selectedDate,
    currentRoutineLabel: workoutHook.currentRoutineLabel
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans pb-24 md:pb-6 select-none">
      {/* Top Bar & Active Shift Cycle Header */}
      <HeaderNav
        selectedDate={ledgerHook.selectedDate}
        onShiftDate={ledgerHook.shiftDate}
        onJumpToToday={ledgerHook.jumpToToday}
        currentShift={ledgerHook.currentDay.shift}
        onUpdateShift={(shift) => ledgerHook.updateCurrentDay('shift', shift)}
        cloudStatus={ledgerHook.cloudStatus}
      />

      {/* Rest Timer Banner */}
      <RestTimerBanner
        active={timerHook.restTimer.active}
        secondsLeft={timerHook.restTimer.secondsLeft}
        label={timerHook.restTimer.label}
        onDismiss={timerHook.dismissRestTimer}
      />

      {/* Core Vital HUD (Rendered across Dashboard, Log Food, and Workout tabs) */}
      {(activeTab === 'dashboard' || activeTab === 'log' || activeTab === 'workout') && (
        <VitalHUD currentDay={ledgerHook.currentDay} />
      )}

      {/* Main Tab Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            selectedDate={ledgerHook.selectedDate}
            currentDay={ledgerHook.currentDay}
            dashboardTimeframe={ledgerHook.dashboardTimeframe}
            onSetDashboardTimeframe={ledgerHook.setDashboardTimeframe}
            ledgerTimeframe={ledgerHook.ledgerTimeframe}
            onSetLedgerTimeframe={ledgerHook.setLedgerTimeframe}
            chartData={ledgerHook.chartData}
            historicalRows={ledgerHook.historicalRows}
            onUpdateCurrentDay={ledgerHook.updateCurrentDay}
            onUpdateDayShift={ledgerHook.updateDayShift}
          />
        )}

        {activeTab === 'log' && (
          <LogFoodTab
            selectedDate={ledgerHook.selectedDate}
            currentDay={ledgerHook.currentDay}
            mealInput={nutritionHook.mealInput}
            onMealInputChange={nutritionHook.setMealInput}
            onMealTextChange={nutritionHook.handleMealTextChange}
            onParseMealInput={nutritionHook.parseMealInput}
            isLoading={nutritionHook.isLoading}
            autocompleteSuggestions={nutritionHook.autocompleteSuggestions}
            onAddPantryItemToMeal={nutritionHook.addPantryItemToMeal}
            loggedFoodToast={nutritionHook.loggedFoodToast}
            onDismissLoggedFoodToast={() => nutritionHook.setLoggedFoodToast(null)}
            onOpenEditMealItem={nutritionHook.openEditMealItem}
            onRecalculateDayNutrition={nutritionHook.recalculateDayNutrition}
            onUpdateCurrentDay={ledgerHook.updateCurrentDay}
            onUpdateCurrentDayFields={ledgerHook.updateCurrentDayFields}
            pantry={pantryHook.pantry}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutTab
            selectedDate={ledgerHook.selectedDate}
            currentDay={ledgerHook.currentDay}
            safeBenchmarks={workoutHook.safeBenchmarks}
            routineExercises={workoutHook.routineExercises}
            currentRoutineLabel={workoutHook.currentRoutineLabel}
            workoutConfirmToast={workoutHook.workoutConfirmToast}
            onConfirmWorkoutSelection={workoutHook.confirmWorkoutSelection}
            onDismissWorkoutConfirmToast={() => workoutHook.setWorkoutConfirmToast(false)}
            onUpdateCurrentDay={ledgerHook.updateCurrentDay}
            onUpdateExerciseSet={workoutHook.updateExerciseSet}
            onAutofillExercise={workoutHook.autofillExercise}
            onAutofillRoutineExercise={workoutHook.autofillRoutineExercise}
            onStartRestTimer={timerHook.startRestTimer}
            onOpenAddExerciseModal={workoutHook.openAddExerciseModal}
            onOpenEditExerciseModal={workoutHook.openEditExerciseModal}
            onDeleteExercise={workoutHook.handleDeleteExercise}
            onResetRoutineToDefaults={workoutHook.resetRoutineToDefaults}
            onMoveExercise={workoutHook.handleMoveExercise}
          />
        )}

        {activeTab === 'pantry' && (
          <PantryTab
            pantry={pantryHook.pantry}
            filteredPantry={pantryHook.filteredPantry}
            pantrySearch={pantryHook.pantrySearch}
            onSetPantrySearch={pantryHook.setPantrySearch}
            onOpenManualPantryModal={pantryHook.openManualPantryModal}
            onAddPantryItemToMeal={nutritionHook.addPantryItemToMeal}
            onDeletePantryItem={pantryHook.deletePantryItem}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorTab
            advisorHistory={advisorHook.advisorHistory}
            advisorQuestion={advisorHook.advisorQuestion}
            isAdvisorThinking={advisorHook.isAdvisorThinking}
            onSetAdvisorQuestion={advisorHook.setAdvisorQuestion}
            onClearHistory={advisorHook.clearAdvisorHistory}
            onSubmitQuestion={advisorHook.handleAdvisorSubmit}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            apiKey={apiKey}
            onSetApiKey={setApiKey}
            cloudStatus={ledgerHook.cloudStatus}
            ledger={ledgerHook.ledger}
            onRestoreLedger={ledgerHook.setLedger}
            pantry={pantryHook.pantry}
            onRestorePantry={pantryHook.setPantry}
            benchmarks={workoutHook.benchmarks}
            onRestoreBenchmarks={workoutHook.setBenchmarks}
          />
        )}
      </main>

      {/* Logged Meal Item Editor Modal */}
      <MealItemEditorModal
        editorState={nutritionHook.mealItemEditor}
        onClose={() => nutritionHook.setMealItemEditor(null)}
        onSave={nutritionHook.handleSaveEditedMealItem}
        onChangeItem={(updater) => {
          if (!nutritionHook.mealItemEditor) return;
          nutritionHook.setMealItemEditor({
            ...nutritionHook.mealItemEditor,
            item: updater(nutritionHook.mealItemEditor.item)
          });
        }}
      />

      {/* Pantry Item Manual Key-In & Verification Modal */}
      <PantryItemModal
        editorState={pantryHook.pantryEditor}
        onClose={pantryHook.closePantryEditor}
        onSave={pantryHook.savePantryEditorItem}
        onUpdateField={pantryHook.updatePantryEditorField}
      />

      {/* Workout Exercise Add / Edit Modal */}
      <ExerciseEditorModal
        editorState={workoutHook.exerciseEditor}
        onClose={() => workoutHook.setExerciseEditor((prev) => ({ ...prev, open: false }))}
        onSave={workoutHook.handleSaveExercise}
        onChangeExercise={(updater) => {
          workoutHook.setExerciseEditor((prev) => ({
            ...prev,
            exercise: updater(prev.exercise)
          }));
        }}
      />

      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Bottom Tab Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
