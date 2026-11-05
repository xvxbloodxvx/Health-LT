import React from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import type { PantryItemForm } from '../types';

interface PantryItemModalProps {
  editorState: {
    open: boolean;
    isEditing: boolean;
    item: PantryItemForm;
  };
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onUpdateField: <K extends keyof PantryItemForm>(field: K, value: PantryItemForm[K]) => void;
}

export const PantryItemModal: React.FC<PantryItemModalProps> = ({
  editorState,
  onClose,
  onSave,
  onUpdateField
}) => {
  if (!editorState.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 space-y-4 font-mono text-xs shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            {editorState.isEditing ? (
              <Pencil size={16} className="text-zinc-300" />
            ) : (
              <Plus size={16} className="text-zinc-300" />
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {editorState.isEditing ? 'Edit Pantry Food Details' : 'Manual Key In: Food & Nutrition Details'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans">
                Key in precise packaging or USDA data to calculate macros deterministically.
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

        <form onSubmit={onSave} className="space-y-4">
          {/* Basic Food Info */}
          <div className="space-y-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item Identification</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label htmlFor="pantry_item_name" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Food / Brand Name *
                </label>
                <input
                  id="pantry_item_name"
                  type="text"
                  required
                  value={editorState.item.name}
                  onChange={(e) => onUpdateField('name', e.target.value)}
                  placeholder="e.g. Grass-fed Butter, Salmon, Whey..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-sans text-xs focus:border-zinc-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="pantry_base_grams" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Serving Base (g / ml)
                </label>
                <input
                  id="pantry_base_grams"
                  type="number"
                  min="0.1"
                  step="any"
                  value={editorState.item.base_grams ?? ''}
                  onChange={(e) => onUpdateField('base_grams', parseFloat(e.target.value) || 100)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="space-y-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Macronutrients (per {editorState.item.base_grams || 100}g / ml)
              </div>
              <button
                type="button"
                onClick={() => {
                  const p = Number(editorState.item.protein) || 0;
                  const c = Number(editorState.item.net_carbs) || 0;
                  const f = Number(editorState.item.fat) || 0;
                  const calculated = Math.round(p * 4 + c * 4 + f * 9);
                  onUpdateField('calories', calculated);
                }}
                className="text-[10px] text-amber-400/90 hover:text-amber-300 underline cursor-pointer"
              >
                Auto-calc (~{Math.round((Number(editorState.item.protein) || 0) * 4 + (Number(editorState.item.net_carbs) || 0) * 4 + (Number(editorState.item.fat) || 0) * 9)} kcal)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="pantry_cal" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Calories (kcal) *
                </label>
                <input
                  id="pantry_cal"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.calories ?? ''}
                  onChange={(e) => onUpdateField('calories', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none font-bold text-amber-300"
                />
              </div>

              <div>
                <label htmlFor="pantry_p" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Protein (g)
                </label>
                <input
                  id="pantry_p"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.protein ?? ''}
                  onChange={(e) => onUpdateField('protein', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="pantry_nc" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Net Carbs (g)
                </label>
                <input
                  id="pantry_nc"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.net_carbs ?? ''}
                  onChange={(e) => onUpdateField('net_carbs', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="pantry_fiber" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Fiber (g)
                </label>
                <input
                  id="pantry_fiber"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.fiber ?? ''}
                  onChange={(e) => onUpdateField('fiber', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="pantry_fat" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Total Fat (g)
                </label>
                <input
                  id="pantry_fat"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.fat ?? ''}
                  onChange={(e) => onUpdateField('fat', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Electrolytes & Minerals */}
          <div className="space-y-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Electrolytes & Minerals (mg per {editorState.item.base_grams || 100}g / ml)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label htmlFor="pantry_na" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Sodium (Na)
                </label>
                <input
                  id="pantry_na"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.sodium ?? ''}
                  onChange={(e) => onUpdateField('sodium', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="pantry_k" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Potassium (K)
                </label>
                <input
                  id="pantry_k"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.potassium ?? ''}
                  onChange={(e) => onUpdateField('potassium', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="pantry_mg" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Magnesium (Mg)
                </label>
                <input
                  id="pantry_mg"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.magnesium ?? ''}
                  onChange={(e) => onUpdateField('magnesium', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="pantry_ca" className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Calcium (Ca)
                </label>
                <input
                  id="pantry_ca"
                  type="number"
                  min="0"
                  step="any"
                  value={editorState.item.calcium ?? ''}
                  onChange={(e) => onUpdateField('calcium', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={!editorState.item.name.trim()}
              className="flex-1 py-2 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl cursor-pointer transition-colors shadow"
            >
              {editorState.isEditing ? 'Save Changes' : 'Commit to Verified Pantry'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
