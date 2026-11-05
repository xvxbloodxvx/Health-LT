import React from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import type { RoutineExercise } from '../types';

interface ExerciseEditorModalProps {
  editorState: {
    open: boolean;
    isEditing: boolean;
    routineId: string;
    exercise: RoutineExercise;
  };
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChangeExercise: (updater: (prev: RoutineExercise) => RoutineExercise) => void;
}

export const ExerciseEditorModal: React.FC<ExerciseEditorModalProps> = ({
  editorState,
  onClose,
  onSave,
  onChangeExercise
}) => {
  if (!editorState.open) return null;

  const { isEditing, exercise } = editorState;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 font-mono text-xs shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Pencil size={16} className="text-emerald-400" />
            ) : (
              <Plus size={16} className="text-emerald-400" />
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {isEditing ? 'Edit Exercise' : 'Add New Exercise'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans">
                Configure sets, target reps, rest intervals, and weight load.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label htmlFor="ex_name" className="text-[10px] text-zinc-400 uppercase block mb-1">
              Exercise Name *
            </label>
            <input
              id="ex_name"
              type="text"
              required
              placeholder="e.g. Incline DB Bench Press"
              value={exercise.name}
              onChange={(e) => onChangeExercise((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ex_sets" className="text-[10px] text-zinc-400 uppercase block mb-1">
                Number of Sets (1-10)
              </label>
              <input
                id="ex_sets"
                type="number"
                min="1"
                max="10"
                required
                value={exercise.sets}
                onChange={(e) => onChangeExercise((prev) => ({ ...prev, sets: parseInt(e.target.value, 10) || 1 }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="ex_target_reps" className="text-[10px] text-zinc-400 uppercase block mb-1">
                Target Reps / Set
              </label>
              <input
                id="ex_target_reps"
                type="number"
                min="1"
                required
                value={exercise.target_reps}
                onChange={(e) => onChangeExercise((prev) => ({ ...prev, target_reps: parseInt(e.target.value, 10) || 1 }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ex_rest" className="text-[10px] text-zinc-400 uppercase block mb-1">
                Rest Timer (sec)
              </label>
              <input
                id="ex_rest"
                type="number"
                min="0"
                step="15"
                required
                value={exercise.rest_sec}
                onChange={(e) => onChangeExercise((prev) => ({ ...prev, rest_sec: parseInt(e.target.value, 10) || 0 }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="ex_weight" className="text-[10px] text-zinc-400 uppercase block mb-1">
                Default Weight (kg)
              </label>
              <input
                id="ex_weight"
                type="number"
                min="0"
                step="0.5"
                disabled={!exercise.has_weight}
                value={exercise.has_weight ? (exercise.default_weight ?? 0) : ''}
                placeholder={exercise.has_weight ? "0" : "Bodyweight"}
                onChange={(e) => onChangeExercise((prev) => ({ ...prev, default_weight: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono text-xs focus:border-zinc-500 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="ex_has_weight"
              checked={exercise.has_weight || false}
              onChange={(e) => onChangeExercise((prev) => ({
                ...prev,
                has_weight: e.target.checked,
                default_weight: e.target.checked ? (prev.default_weight || 5) : undefined
              }))}
              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="ex_has_weight" className="text-zinc-300 text-xs cursor-pointer select-none">
              Track weight for each set (e.g. Dumbbell / Weighted load)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 border-t border-zinc-800">
            <button
              type="submit"
              disabled={!exercise.name.trim()}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl cursor-pointer transition-colors shadow"
            >
              {isEditing ? 'Save Changes' : 'Add Exercise to Routine'}
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
