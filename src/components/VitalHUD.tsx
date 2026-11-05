import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { DayLedgerEntry } from '../types';

export interface VitalHUDProps {
  currentDay: DayLedgerEntry;
}

export const VitalHUD: React.FC<VitalHUDProps> = ({ currentDay }) => {
  const calories = currentDay.calories || 0;
  const netCarbs = currentDay.net_carbs || 0;
  const protein = currentDay.protein || 0;
  const fiber = currentDay.fiber || 0;
  const sodium = currentDay.sodium || 0;
  const potassium = currentDay.potassium || 0;
  const magnesium = currentDay.magnesium || 0;

  // Calorie limit check (> 1500 kcal flag)
  const caloriesExceeded = calories > 1500;

  return (
    <section className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-3.5">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          
          {/* 1. Calories: Only actual consumed calories shown. No 1400 max. Red/amber alert if > 1500 */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              caloriesExceeded
                ? "bg-rose-950/40 border-rose-800 text-rose-300"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-100"
            }`}
          >
            <div className="text-[10px] uppercase font-mono tracking-wider flex justify-between items-center">
              <span>Calories</span>
              {caloriesExceeded && <ShieldAlert size={12} className="text-rose-400" />}
            </div>
            <div className="text-base font-bold mt-0.5">
              {Math.round(calories)} <span className="text-[10px] font-normal text-zinc-400">kcal</span>
            </div>
            {caloriesExceeded ? (
              <div className="text-[9px] font-mono text-rose-400 mt-1 font-semibold">
                &gt; 1,500 Limit Flag
              </div>
            ) : (
              <div className="text-[9px] font-mono text-zinc-500 mt-1">
                Standard Intake
              </div>
            )}
          </div>

          {/* 2. Net Carbs (30g soft ceiling, 50g hard ceiling) */}
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              netCarbs > 50
                ? "bg-rose-950/40 border-rose-800 text-rose-300"
                : netCarbs > 30
                ? "bg-amber-950/40 border-amber-800 text-amber-300"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-100"
            }`}
          >
            <div className="text-[10px] uppercase font-mono tracking-wider flex justify-between items-center">
              <span>Net Carbs</span>
              {netCarbs > 30 && <ShieldAlert size={12} className="text-amber-400" />}
            </div>
            <div className="text-base font-bold">
              {netCarbs}g <span className="text-[10px] font-normal opacity-70">/ 30g</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  netCarbs > 50
                    ? "bg-rose-500"
                    : netCarbs > 30
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(100, (netCarbs / 30) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 3. Protein */}
          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Protein</div>
            <div className="text-base font-bold text-zinc-100">
              {protein}g <span className="text-[10px] font-normal text-zinc-500">/ 110g</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (protein / 110) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 4. Fiber */}
          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Dietary Fiber</div>
            <div className="text-base font-bold text-zinc-100">
              {fiber}g <span className="text-[10px] font-normal text-zinc-500">/ 38g</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-teal-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (fiber / 38) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 5. Sodium */}
          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Sodium (Na)</div>
            <div className="text-base font-bold text-zinc-100">
              {Math.round(sodium)} <span className="text-[10px] font-normal text-zinc-500">/ 2500mg</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (sodium / 2500) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 6. Potassium & Magnesium Combined Card */}
          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">K / Mg (mg)</div>
            <div className="text-base font-bold text-zinc-100">
              {Math.round(potassium)} <span className="text-zinc-500 text-xs">/</span> {Math.round(magnesium)}
            </div>
            <div className="text-[10px] text-zinc-400 flex justify-between mt-1">
              <span>K: 3500</span>
              <span>Mg: 420</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VitalHUD;
