import { useState } from 'react';
import type { MealItem, DayLedgerEntry, PantryItem } from '../types';
import {
  parseNaturalMealText,
  parseMultiComponentMealText,
  calculateAtwaterCalories
} from '../utils/nutrition';

interface UseNutritionProps {
  currentDay: DayLedgerEntry;
  updateCurrentDay: (field: keyof DayLedgerEntry, value: unknown) => void;
  updateCurrentDayFields: (fields: Partial<DayLedgerEntry>) => void;
  pantry: PantryItem[];
}

export function useNutrition({
  currentDay,
  updateCurrentDay,
  updateCurrentDayFields,
  pantry
}: UseNutritionProps) {
  const [mealInput, setMealInput] = useState<{ targetMeal: string; text: string }>({
    targetMeal: 'meal_1',
    text: ''
  });
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Meal Item Quick-Editor State
  const [mealItemEditor, setMealItemEditor] = useState<{
    open: boolean;
    mealKey: string;
    item: MealItem;
  } | null>(null);

  const [loggedFoodToast, setLoggedFoodToast] = useState<{
    message: string;
    subtext: string;
    mealKey: string;
    item: MealItem;
  } | null>(null);

  const handleMealTextChange = (text: string) => {
    setMealInput((prev) => ({ ...prev, text }));
    if (!text.trim() || pantry.length === 0) {
      setAutocompleteSuggestions([]);
      return;
    }
    const query = text.toLowerCase();
    const matches = pantry.filter((item) => item.name.toLowerCase().includes(query));
    setAutocompleteSuggestions(matches.slice(0, 4));
  };

  // Batched nutrition calculation: updates all 10 fields in a single state mutation
  const recalculateDayNutrition = (updatedMeals: Record<string, MealItem[]>) => {
    let cal = 0, p = 0, nc = 0, fib = 0, f = 0, na = 0, k = 0, mg = 0, ca = 0;
    Object.values(updatedMeals).forEach((mealArray) => {
      mealArray.forEach((item) => {
        cal += item.calories || 0;
        p += item.protein || 0;
        nc += item.net_carbs || 0;
        fib += item.fiber || 0;
        f += item.fat || 0;
        na += item.sodium || 0;
        k += item.potassium || 0;
        mg += item.magnesium || 0;
        ca += item.calcium || 0;
      });
    });

    const batchUpdates: Partial<DayLedgerEntry> = {
      calories: Number(cal.toFixed(1)),
      protein: Number(p.toFixed(1)),
      net_carbs: Number(nc.toFixed(1)),
      fiber: Number(fib.toFixed(1)),
      fat: Number(f.toFixed(1)),
      sodium: Number(na.toFixed(1)),
      potassium: Number(k.toFixed(1)),
      magnesium: Number(mg.toFixed(1)),
      calcium: Number(ca.toFixed(1)),
      meals: {
        meal_1: updatedMeals.meal_1 || [],
        meal_2: updatedMeals.meal_2 || [],
        meal_3: updatedMeals.meal_3 || [],
        ...updatedMeals
      }
    };

    updateCurrentDayFields(batchUpdates);
  };

  const addPantryItemToMeal = (pantryItem: PantryItem, grams = 100) => {
    const factor = grams / (pantryItem.base_grams || 100);
    const lineItem: MealItem = {
      id: Date.now().toString(),
      name: `${pantryItem.name} (${grams}g)`,
      calories: Math.round(pantryItem.calories * factor),
      protein: Number((pantryItem.protein * factor).toFixed(1)),
      net_carbs: Number((pantryItem.net_carbs * factor).toFixed(1)),
      fiber: Number(((pantryItem.fiber || 0) * factor).toFixed(1)),
      fat: Number(((pantryItem.fat || 0) * factor).toFixed(1)),
      sodium: Math.round((pantryItem.sodium || 0) * factor),
      potassium: Math.round((pantryItem.potassium || 0) * factor),
      magnesium: Math.round((pantryItem.magnesium || 0) * factor),
      calcium: Math.round((pantryItem.calcium || 0) * factor),
      source: 'verified_pantry'
    };

    const target = mealInput.targetMeal;
    const existing = currentDay.meals?.[target] || [];
    const updatedMeals = {
      ...(currentDay.meals || { meal_1: [], meal_2: [], meal_3: [] }),
      [target]: [...existing, lineItem]
    };

    recalculateDayNutrition(updatedMeals);
    setMealInput({ targetMeal: target, text: '' });
    setAutocompleteSuggestions([]);
  };

  const parseMealInput = async () => {
    if (!mealInput.text.trim()) return;
    const inputQuery = mealInput.text.trim();
    setIsLoading(true);

    let newItems: MealItem[] = [];
    const clientApiKey = localStorage.getItem('gemini_api_key') || '';

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(clientApiKey ? { 'Authorization': `Bearer ${clientApiKey}` } : {})
        },
        body: JSON.stringify({ query: inputQuery })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          newItems = data.items;
        } else if (data.item) {
          newItems = [data.item];
        } else {
          newItems = parseMultiComponentMealText(inputQuery);
        }
      } else {
        newItems = parseMultiComponentMealText(inputQuery);
      }
    } catch {
      // Offline or static hosting fallback: uses Singapore HPB high-precision deterministic engine
      newItems = parseMultiComponentMealText(inputQuery);
    }

    if (newItems.length === 0) {
      newItems = [parseNaturalMealText(inputQuery)];
    }

    const target = mealInput.targetMeal;
    const existing = currentDay.meals?.[target] || [];
    const updatedMeals = {
      ...(currentDay.meals || { meal_1: [], meal_2: [], meal_3: [] }),
      [target]: [...existing, ...newItems]
    };
    recalculateDayNutrition(updatedMeals);
    setMealInput({ targetMeal: target, text: '' });
    setIsLoading(false);

    const totalCal = newItems.reduce((acc, it) => acc + (it.calories || 0), 0);
    const totalNC = Number(newItems.reduce((acc, it) => acc + (it.net_carbs || 0), 0).toFixed(1));
    const totalP = Number(newItems.reduce((acc, it) => acc + (it.protein || 0), 0).toFixed(1));

    if (newItems.length === 1) {
      const lineItem = newItems[0];
      setLoggedFoodToast({
        message: `Logged to ${target.replace('_', ' ').toUpperCase()}: ${lineItem.name}`,
        subtext: `${lineItem.calories} kcal • ${lineItem.protein}g Protein • ${lineItem.net_carbs}g Net Carbs • ${lineItem.fat || 0}g Fat • ${lineItem.fiber || 0}g Fiber • ${lineItem.sodium || 0}mg Na • ${lineItem.potassium || 0}mg K • ${lineItem.magnesium || 0}mg Mg • ${lineItem.calcium || 0}mg Ca`,
        mealKey: target,
        item: lineItem
      });
    } else {
      setLoggedFoodToast({
        message: `Logged ${newItems.length} items to ${target.replace('_', ' ').toUpperCase()}: ${newItems.map((it) => it.name).join(', ')}`,
        subtext: `Total: ${totalCal} kcal • ${totalP}g Protein • ${totalNC}g Net Carbs across ${newItems.length} items`,
        mealKey: target,
        item: newItems[0]
      });
    }
    setTimeout(() => {
      setLoggedFoodToast(null);
    }, 7000);
  };

  const openEditMealItem = (mealKey: string, item: MealItem) => {
    setMealItemEditor({
      open: true,
      mealKey,
      item: { ...item }
    });
  };

  const handleSaveEditedMealItem = (mealKey: string, sanitizedItem: MealItem) => {
    const existing = currentDay.meals?.[mealKey] || [];
    const updatedList = existing.map((x) => (x.id === sanitizedItem.id ? sanitizedItem : x));
    const updatedMeals = {
      ...(currentDay.meals || { meal_1: [], meal_2: [], meal_3: [] }),
      [mealKey]: updatedList
    };
    recalculateDayNutrition(updatedMeals);
    setMealItemEditor(null);
  };

  return {
    mealInput,
    setMealInput,
    autocompleteSuggestions,
    isLoading,
    loggedFoodToast,
    setLoggedFoodToast,
    mealItemEditor,
    setMealItemEditor,
    handleMealTextChange,
    addPantryItemToMeal,
    parseMealInput,
    openEditMealItem,
    handleSaveEditedMealItem,
    recalculateDayNutrition
  };
}
