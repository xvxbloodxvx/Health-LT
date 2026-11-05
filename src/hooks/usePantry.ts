import { useState, useEffect, useMemo, useRef } from 'react';
import type { PantryItem, PantryItemForm } from '../types';
import { savePantryToFirestore } from '../firebase';

const DEFAULT_PANTRY: PantryItem[] = [
  { id: '1', name: 'Pasture Eggs (Large)', base_grams: 100, calories: 143, protein: 12.6, net_carbs: 0.7, fiber: 0, fat: 9.5, sodium: 142, potassium: 138, magnesium: 12 },
  { id: '2', name: 'Grass-fed Butter', base_grams: 100, calories: 717, protein: 0.9, net_carbs: 0.1, fiber: 0, fat: 81.1, sodium: 11, potassium: 24, magnesium: 2 },
  { id: '3', name: 'Wild Atlantic Salmon', base_grams: 100, calories: 208, protein: 20.4, net_carbs: 0, fiber: 0, fat: 13.4, sodium: 59, potassium: 490, magnesium: 29 },
  { id: '4', name: 'Raw Hass Avocado', base_grams: 100, calories: 160, protein: 2.0, net_carbs: 1.8, fiber: 6.7, fat: 14.7, sodium: 7, potassium: 485, magnesium: 29 },
  { id: '5', name: 'Organic Baby Spinach', base_grams: 100, calories: 23, protein: 2.9, net_carbs: 1.4, fiber: 2.2, fat: 0.4, sodium: 79, potassium: 558, magnesium: 79 },
  { id: '6', name: 'Whey Protein Isolate', base_grams: 100, calories: 375, protein: 87.5, net_carbs: 2.5, fiber: 0, fat: 1.2, sodium: 180, potassium: 450, magnesium: 65 }
];

export function usePantry() {
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('user_pantry');
      return saved ? JSON.parse(saved) : DEFAULT_PANTRY;
    } catch {
      return DEFAULT_PANTRY;
    }
  });

  const [pantrySearch, setPantrySearch] = useState<string>('');

  const [pantryEditor, setPantryEditor] = useState<{
    open: boolean;
    isEditing: boolean;
    item: PantryItemForm;
  }>({
    open: false,
    isEditing: false,
    item: {
      id: '',
      name: '',
      base_grams: 100,
      calories: 0,
      protein: 0,
      net_carbs: 0,
      fiber: 0,
      fat: 0,
      sodium: 0,
      potassium: 0,
      magnesium: 0,
      calcium: 0
    }
  });

  const isInitialMount = useRef(true);

  // Sync to LocalStorage & Firestore
  useEffect(() => {
    try {
      localStorage.setItem('user_pantry', JSON.stringify(pantry));
      if (!isInitialMount.current) {
        savePantryToFirestore(pantry);
      }
    } catch {
      // ignore
    }
    isInitialMount.current = false;
  }, [pantry]);

  const filteredPantry = useMemo(() => {
    if (!pantrySearch.trim()) return pantry;
    const q = pantrySearch.toLowerCase().trim();
    return pantry.filter((item) => item.name.toLowerCase().includes(q));
  }, [pantry, pantrySearch]);

  const openManualPantryModal = (itemToEdit?: PantryItem) => {
    if (itemToEdit) {
      setPantryEditor({
        open: true,
        isEditing: true,
        item: {
          id: itemToEdit.id,
          name: itemToEdit.name,
          base_grams: itemToEdit.base_grams ?? 100,
          calories: itemToEdit.calories ?? 0,
          protein: itemToEdit.protein ?? 0,
          net_carbs: itemToEdit.net_carbs ?? 0,
          fiber: itemToEdit.fiber ?? 0,
          fat: itemToEdit.fat ?? 0,
          sodium: itemToEdit.sodium ?? 0,
          potassium: itemToEdit.potassium ?? 0,
          magnesium: itemToEdit.magnesium ?? 0,
          calcium: itemToEdit.calcium ?? 0
        }
      });
    } else {
      setPantryEditor({
        open: true,
        isEditing: false,
        item: {
          id: Date.now().toString(),
          name: '',
          base_grams: 100,
          calories: 0,
          protein: 0,
          net_carbs: 0,
          fiber: 0,
          fat: 0,
          sodium: 0,
          potassium: 0,
          magnesium: 0,
          calcium: 0
        }
      });
    }
  };

  const updatePantryEditorField = <K extends keyof PantryItemForm>(
    field: K,
    value: PantryItemForm[K]
  ) => {
    setPantryEditor((prev) => ({
      ...prev,
      item: {
        ...prev.item,
        [field]: value
      }
    }));
  };

  const savePantryEditorItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pantryEditor.item.name.trim()) return;

    const sanitizedItem: PantryItem = {
      id: pantryEditor.item.id || Date.now().toString(),
      name: pantryEditor.item.name.trim(),
      base_grams:
        Number(pantryEditor.item.base_grams) > 0 ? Number(pantryEditor.item.base_grams) : 100,
      calories: Number(pantryEditor.item.calories) || 0,
      protein: Number(pantryEditor.item.protein) || 0,
      net_carbs: Number(pantryEditor.item.net_carbs) || 0,
      fiber: Number(pantryEditor.item.fiber) || 0,
      fat: Number(pantryEditor.item.fat) || 0,
      sodium: Number(pantryEditor.item.sodium) || 0,
      potassium: Number(pantryEditor.item.potassium) || 0,
      magnesium: Number(pantryEditor.item.magnesium) || 0,
      calcium: Number(pantryEditor.item.calcium) || 0
    };

    setPantry((prev) => {
      const exists = prev.some((x) => x.id === sanitizedItem.id);
      if (exists) {
        return prev.map((p) => (p.id === sanitizedItem.id ? sanitizedItem : p));
      } else {
        return [sanitizedItem, ...prev];
      }
    });

    setPantryEditor((prev) => ({ ...prev, open: false }));
  };

  const deletePantryItem = (id: string) => {
    setPantry((prev) => prev.filter((x) => x.id !== id));
  };

  const closePantryEditor = () => {
    setPantryEditor((prev) => ({ ...prev, open: false }));
  };

  return {
    pantry,
    setPantry,
    pantrySearch,
    setPantrySearch,
    filteredPantry,
    pantryEditor,
    openManualPantryModal,
    updatePantryEditorField,
    savePantryEditorItem,
    deletePantryItem,
    closePantryEditor
  };
}
