import React from 'react';
import { Activity, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DayLedgerEntry } from '../types';
import { formatDateDDMM } from '../utils/nutrition';
import { getDefaultShiftForDate } from '../utils/shift';

interface ChartPoint {
  date: string;
  rawDate: string;
  weight: number | null;
  net_carbs: number;
  protein: number;
  calories: number;
  sleep: number | null;
}

interface DashboardTabProps {
  selectedDate: string;
  currentDay: DayLedgerEntry;
  dashboardTimeframe: '7' | '30';
  onSetDashboardTimeframe: (tf: '7' | '30') => void;
  ledgerTimeframe: '7' | '30' | 'all';
  onSetLedgerTimeframe: (tf: '7' | '30' | 'all') => void;
  chartData: ChartPoint[];
  historicalRows: [string, DayLedgerEntry][];
  onUpdateCurrentDay: (field: keyof DayLedgerEntry, value: unknown) => void;
  onUpdateDayShift: (dateKey: string, shiftValue: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  selectedDate,
  currentDay,
  dashboardTimeframe,
  onSetDashboardTimeframe,
  ledgerTimeframe,
  onSetLedgerTimeframe,
  chartData,
  historicalRows,
  onUpdateCurrentDay,
  onUpdateDayShift
}) => {
  return (
    <div className="space-y-6">
      {/* Morning Weight & Sleep Quick Log Bar */}
      <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-zinc-800/80 rounded-xl text-zinc-300">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase font-mono">
              Morning Weight ({formatDateDDMM(selectedDate)})
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="number"
                step="0.05"
                aria-label="Morning Weight"
                value={currentDay.weight_kg ?? ''}
                placeholder="00.0"
                onChange={(e) =>
                  onUpdateCurrentDay('weight_kg', parseFloat(e.target.value) || null)
                }
                className="bg-transparent text-xl font-bold font-mono text-zinc-100 w-24 outline-none border-b border-zinc-700 focus:border-zinc-300"
              />
              <span className="text-xs text-zinc-500 font-mono">kg</span>
            </div>
          </div>
        </div>

        {/* Sleep Profile */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-zinc-800/80 rounded-xl text-zinc-300">
            <Moon size={20} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase font-mono">Sleep Duration</div>
            <div className="flex items-baseline space-x-1">
              <input
                type="number"
                step="0.25"
                aria-label="Sleep Duration"
                value={currentDay.sleep_hours ?? ''}
                placeholder="0.0"
                onChange={(e) =>
                  onUpdateCurrentDay('sleep_hours', parseFloat(e.target.value) || null)
                }
                className="bg-transparent text-xl font-bold font-mono text-zinc-100 w-16 outline-none border-b border-zinc-700 focus:border-zinc-300"
              />
              <span className="text-xs text-zinc-500 font-mono">hrs</span>
            </div>
          </div>
        </div>

        {/* Bowel Movement Counter */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="text-xs text-zinc-500 uppercase font-mono">BM Count</div>
            <div className="flex items-center space-x-1 mt-1">
              {[0, 1, 2].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdateCurrentDay('bm_count', num)}
                  aria-label={`BM count ${num}`}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    currentDay.bm_count === num
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weight Trajectory Chart (Switchable between 7 Days and 30 Days View) */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <div className="text-xs font-mono font-semibold text-zinc-200">
              {dashboardTimeframe === '7' ? '7-Day' : '30-Day'} Weight Trajectory (kg)
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>
                Latest: <strong className="text-zinc-200">{currentDay.weight_kg || 89.15} kg</strong>
              </span>
              <span>•</span>
              <span>
                {dashboardTimeframe === '7' ? '7D Window' : '30D'} Change:{' '}
                <strong
                  className={
                    Number(
                      (
                        (chartData[chartData.length - 1]?.weight ?? 0) -
                        (chartData[0]?.weight ?? 0)
                      ).toFixed(2)
                    ) <= 0
                      ? 'text-emerald-400 font-bold'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {chartData.length > 1 &&
                  chartData[0]?.weight &&
                  chartData[chartData.length - 1]?.weight
                    ? `${
                        chartData[chartData.length - 1].weight! - chartData[0].weight! > 0
                          ? '+'
                          : ''
                      }${(
                        chartData[chartData.length - 1].weight! - chartData[0].weight!
                      ).toFixed(2)} kg`
                    : '0.00 kg'}
                </strong>
              </span>
              <span>•</span>
              <span>
                All-Time: <strong className="text-emerald-400 font-bold">-9.85 kg</strong>
              </span>
            </div>
          </div>

          {/* Tab switch between 7 and 30 days view */}
          <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => onSetDashboardTimeframe('7')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                dashboardTimeframe === '7'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => onSetDashboardTimeframe('30')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                dashboardTimeframe === '30'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#52525b"
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                fontSize={10}
                tickLine={false}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#e4e4e7"
                strokeWidth={2}
                dot={{ r: 3, fill: '#e4e4e7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Historical Ledger Matrix with 7 Days / 30 Days / All Entries tabs */}
      <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-3 border-b border-zinc-800 text-xs font-mono text-zinc-400 font-semibold tracking-wider uppercase flex flex-wrap justify-between items-center gap-2">
          <span>Historical Ledger Matrix ({historicalRows.length} entries)</span>
          <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            {(['7', '30', 'all'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => onSetLedgerTimeframe(view)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  ledgerTimeframe === view
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {view === '7' ? '7 Days' : view === '30' ? '30 Days' : 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950/95 sticky top-0 z-10 text-zinc-500 border-b border-zinc-800 backdrop-blur">
              <tr>
                <th className="py-2.5 px-3">Date (DD-MM)</th>
                <th className="py-2.5 px-3">Shift</th>
                <th className="py-2.5 px-3">Workout</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Calories</th>
                <th className="py-2.5 px-3">Protein</th>
                <th className="py-2.5 px-3">Net Carbs</th>
                <th className="py-2.5 px-3">Fiber</th>
                <th className="py-2.5 px-3">Na / K / Mg</th>
                <th className="py-2.5 px-3">Sleep</th>
                <th className="py-2.5 px-3">BM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {historicalRows.map(([date, row]) => (
                <tr
                  key={date}
                  className={date === selectedDate ? 'bg-zinc-800/40' : 'hover:bg-zinc-900/30'}
                >
                  <td className="py-2 px-3 font-medium text-zinc-100">{formatDateDDMM(date)}</td>
                  <td className="py-2 px-3">
                    <select
                      value={row.shift || getDefaultShiftForDate(date)}
                      onChange={(e) => onUpdateDayShift(date, e.target.value)}
                      aria-label={`Shift for ${date}`}
                      className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-zinc-200 outline-none cursor-pointer hover:border-zinc-500"
                    >
                      <option value="AM Work">AM Work</option>
                      <option value="PM Work">PM Work</option>
                      <option value="Standby">Standby</option>
                      <option value="Rest">Rest</option>
                    </select>
                  </td>
                  <td className="py-2 px-3 text-[11px]">
                    {row.workout_name ? (
                      <span className="text-emerald-400 font-medium truncate max-w-[120px] inline-block">
                        {row.workout_name}
                      </span>
                    ) : row.workout_confirmed ? (
                      <span className="text-emerald-400">Logged</span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3">{row.weight_kg ?? '—'} kg</td>
                  <td className="py-2 px-3">
                    <span className={(row.calories || 0) > 1500 ? 'text-rose-400 font-bold' : ''}>
                      {row.calories !== undefined && row.calories !== null ? Math.round(row.calories) : '—'}
                    </span>
                  </td>
                  <td className="py-2 px-3">{row.protein ?? '—'}g</td>
                  <td className="py-2 px-3">
                    <span className={(row.net_carbs || 0) > 30 ? 'text-amber-400 font-bold' : ''}>
                      {row.net_carbs ?? '—'}g
                    </span>
                  </td>
                  <td className="py-2 px-3">{row.fiber ?? '—'}g</td>
                  <td className="py-2 px-3 text-zinc-400">
                    {Math.round(row.sodium || 0)}/{Math.round(row.potassium || 0)}/{Math.round(row.magnesium || 0)}
                  </td>
                  <td className="py-2 px-3">{row.sleep_hours ? `${row.sleep_hours}h` : '—'}</td>
                  <td className="py-2 px-3">{row.bm_count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
