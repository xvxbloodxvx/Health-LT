import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDateDDMM, formatDateFullDDMMYYYY } from '../utils/nutrition';
import { getMonthShiftConfig } from '../utils/shift';
import { PWAInstallButton } from './PWAInstallButton';

export interface HeaderNavProps {
  selectedDate: string;
  onShiftDate: (days: number) => void;
  onJumpToToday?: () => void;
  currentShift?: string;
  onUpdateShift: (shift: string) => void;
  cloudStatus?: 'connected' | 'syncing' | 'offline';
}

const SHIFT_OPTIONS = ["AM Work", "PM Work", "Standby", "Rest"] as const;

export const HeaderNav: React.FC<HeaderNavProps> = ({
  selectedDate,
  onShiftDate,
  onJumpToToday,
  currentShift,
  onUpdateShift,
  cloudStatus = 'connected',
}) => {
  const currentMonthNum = parseInt(selectedDate.split('-')[1], 10);
  const currentMonthShiftConfig = getMonthShiftConfig(currentMonthNum);
  const todayISO = new Date().toISOString().split('T')[0];
  const isViewingToday = selectedDate === todayISO;

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 sm:py-3 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Date Navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShiftDate(-1)}
            aria-label="Previous day"
            className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center px-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm font-semibold tracking-wide text-zinc-100">
                {formatDateFullDDMMYYYY(selectedDate)}
              </span>
              {!isViewingToday && onJumpToToday && (
                <button
                  onClick={onJumpToToday}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[10px] font-mono font-medium transition cursor-pointer"
                  title="Jump to today"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Today</span>
                </button>
              )}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono flex items-center justify-center space-x-1">
              <span>{currentMonthShiftConfig.shiftType} Shift Month</span>
              <span>•</span>
              <span>{formatDateDDMM(selectedDate)}</span>
            </div>
          </div>
          <button
            onClick={() => onShiftDate(1)}
            aria-label="Next day"
            className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition-transform"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right section: PWA install button, Sync Status & Shift Switcher */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
          <PWAInstallButton />

          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] font-mono px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-400'
                  : cloudStatus === 'syncing'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <span>
              {cloudStatus === 'connected'
                ? 'Cloud Sync'
                : cloudStatus === 'syncing'
                ? 'Syncing...'
                : 'Offline Cache'}
            </span>
          </div>

          {/* Shift Tag Switcher */}
          <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium overflow-x-auto max-w-full">
            {SHIFT_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => onUpdateShift(tag)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  currentShift === tag
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
