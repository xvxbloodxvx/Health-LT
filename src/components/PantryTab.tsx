import React from 'react';
import { Database, Plus, Camera, Search, X, Pencil, Trash2 } from 'lucide-react';
import type { PantryItem } from '../types';

interface PantryTabProps {
  pantry: PantryItem[];
  filteredPantry: PantryItem[];
  pantrySearch: string;
  onSetPantrySearch: (search: string) => void;
  onOpenManualPantryModal: (itemToEdit?: PantryItem) => void;
  onAddPantryItemToMeal: (item: PantryItem, grams?: number) => void;
  onDeletePantryItem: (itemId: string) => void;
}

export const PantryTab: React.FC<PantryTabProps> = ({
  pantry,
  filteredPantry,
  pantrySearch,
  onSetPantrySearch,
  onOpenManualPantryModal,
  onAddPantryItemToMeal,
  onDeletePantryItem,
}) => {
  return (
    <div className="space-y-5">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 font-mono">Verified Pantry Library</h3>
          <p className="text-xs text-zinc-500 font-sans">
            Source of truth for deterministic nutrition calculation and macro tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onOpenManualPantryModal()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Add Food Manually</span>
          </button>

          <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors">
            <Camera size={14} />
            <span>Scan Label</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={() => {
                onOpenManualPantryModal({
                  id: Date.now().toString(),
                  name: 'Electrolyte Keto Broth Cube',
                  base_grams: 100,
                  calories: 120,
                  protein: 14.5,
                  net_carbs: 1.2,
                  fiber: 0,
                  fat: 6.0,
                  sodium: 1250,
                  potassium: 800,
                  magnesium: 120,
                  calcium: 40
                });
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search / Filter Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={pantrySearch}
          onChange={(e) => onSetPantrySearch(e.target.value)}
          placeholder="Search pantry foods by name..."
          className="w-full pl-8 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
        {pantrySearch && (
          <button
            type="button"
            onClick={() => onSetPantrySearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Pantry Items Grid */}
      {pantry.length === 0 ? (
        <div className="bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-3">
          <Database size={28} className="mx-auto text-zinc-600" />
          <p className="text-xs font-mono text-zinc-400">
            Your pantry is empty. Click &quot;Add Food Manually&quot; to key in your custom food details
            or &quot;Scan Label&quot; to import packaging.
          </p>
          <button
            type="button"
            onClick={() => onOpenManualPantryModal()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold rounded-lg cursor-pointer"
          >
            <Plus size={14} />
            <span>Key In First Food</span>
          </button>
        </div>
      ) : filteredPantry.length === 0 ? (
        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800/80 p-6 text-center text-xs text-zinc-400 font-mono">
          No pantry food matching &quot;{pantrySearch}&quot;.
          <button
            type="button"
            onClick={() => onOpenManualPantryModal()}
            className="block mx-auto mt-2 text-zinc-200 underline hover:text-white cursor-pointer"
          >
            Add &quot;{pantrySearch}&quot; manually
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPantry.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-semibold text-xs text-zinc-100 block">{item.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Serving base: {item.base_grams || 100}g / ml
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onAddPantryItemToMeal(item, item.base_grams || 100)}
                    title="Log 1 serving to current day meal log"
                    className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/80 rounded hover:bg-emerald-900/60 cursor-pointer"
                  >
                    + Log
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenManualPantryModal(item)}
                    aria-label={`Edit details for ${item.name}`}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer rounded hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePantryItem(item.id)}
                    aria-label={`Delete ${item.name} from pantry`}
                    className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer rounded hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Macronutrient Breakdown */}
              <div className="text-[11px] font-mono text-zinc-300 grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1 border-t border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 text-[9px] block">CAL</span>
                  {item.calories} kcal
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] block">PROTEIN</span>
                  {item.protein}g
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] block">NET CARB</span>
                  {item.net_carbs}g
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] block">FIBER</span>
                  {item.fiber ?? 0}g
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] block">FAT</span>
                  {item.fat ?? 0}g
                </div>
              </div>

              {/* Electrolytes Breakdown */}
              <div className="text-[10px] font-mono text-zinc-400 grid grid-cols-4 gap-1 pt-1 border-t border-zinc-800/50">
                <div>
                  <span className="text-zinc-600">Na:</span> {item.sodium ?? 0}mg
                </div>
                <div>
                  <span className="text-zinc-600">K:</span> {item.potassium ?? 0}mg
                </div>
                <div>
                  <span className="text-zinc-600">Mg:</span> {item.magnesium ?? 0}mg
                </div>
                <div>
                  <span className="text-zinc-600">Ca:</span> {item.calcium ?? 0}mg
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
