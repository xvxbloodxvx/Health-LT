import React from 'react';
import { Pencil, X } from 'lucide-react';
import type { MealItem } from '../types';
import { calculateAtwaterCalories } from '../utils/nutrition';

interface MealItemEditorModalProps {
  editorState: {
    open: boolean;
    mealKey: string;
    item: MealItem;
  } | null;
  onClose: () => void;
  onSave: (mealKey: string, updatedItem: MealItem) => void;
  onChangeItem: (updater: (prev: MealItem) => MealItem) => void;
}

export const MealItemEditorModal: React.FC<MealItemEditorModalProps> = ({
  editorState,
  onClose,
  onSave,
  onChangeItem
}) => {
  if (!editorState || !editorState.open) return null;

  const { mealKey, item } = editorState;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(item.protein) || 0;
    const nc = Number(item.net_carbs) || 0;
    const f = Number(item.fat) || 0;
    const fib = Number(item.fiber) || 0;
    const atwaterCal = calculateAtwaterCalories(p, nc, f);

    const sanitizedItem: MealItem = {
      ...item,
      name: item.name.trim(),
      protein: Number(p.toFixed(1)),
      net_carbs: Number(nc.toFixed(1)),
      fat: Number(f.toFixed(1)),
      fiber: Number(fib.toFixed(1)),
      calories: Number(item.calories) > 0 ? Number(Number(item.calories).toFixed(1)) : atwaterCal,
      sodium: Number(Number(item.sodium || 0).toFixed(1)),
      potassium: Number(Number(item.potassium || 0).toFixed(1)),
      magnesium: Number(Number(item.magnesium || 0).toFixed(1)),
      calcium: Number(Number(item.calcium || 0).toFixed(1)),
    };

    onSave(mealKey, sanitizedItem);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 font-mono text-xs shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Pencil size={16} className="text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Edit Logged Meal Item</h3>
              <p className="text-[10px] text-zinc-500 font-sans">
                Correct Net Carbs and nutritional breakdown directly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase block mb-1">
              Item Description
            </label>
            <input
              type="text"
              required
              value={item.name}
              onChange={(e) => onChangeItem((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-sans text-xs focus:border-zinc-500 outline-none"
            />
          </div>

          {/* Net Carbs & Calories - Core Focus */}
          <div className="grid grid-cols-2 gap-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800">
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                Net Carbs (g) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={item.net_carbs}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, net_carbs: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-amber-300 font-bold font-mono text-sm focus:border-amber-400 outline-none"
              />
              <div className="text-[9px] text-zinc-500 mt-1 font-sans">Total carbs minus fiber</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-zinc-300 uppercase block">
                  Calories (kcal) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const p = Number(item.protein) || 0;
                    const nc = Number(item.net_carbs) || 0;
                    const f = Number(item.fat) || 0;
                    onChangeItem((prev) => ({ ...prev, calories: calculateAtwaterCalories(p, nc, f) }));
                  }}
                  className="text-[9px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                >
                  Auto-calc
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={item.calories}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, calories: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-bold font-mono text-sm focus:border-zinc-500 outline-none"
              />
              <div className="text-[9px] text-zinc-500 mt-1 font-mono">
                Atwater calc: {calculateAtwaterCalories(item.protein || 0, item.net_carbs || 0, item.fat || 0)} kcal
              </div>
            </div>
          </div>

          {/* Protein, Fat, Fiber */}
          <div className="grid grid-cols-3 gap-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.protein}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Total Fat (g)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.fat ?? 0}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Fiber (g)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.fiber ?? 0}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, fiber: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Complete Micronutrients: Sodium, Potassium, Magnesium, Calcium */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Sodium (mg)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.sodium ?? 0}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, sodium: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Potassium (mg)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.potassium ?? 0}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, potassium: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Magnesium (mg)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.magnesium ?? 0}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, magnesium: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Calcium (mg)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={item.calcium ?? 0}
                onChange={(e) => onChangeItem((prev) => ({ ...prev, calcium: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl cursor-pointer transition-colors shadow"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
