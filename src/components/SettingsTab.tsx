import React, { useState, useRef } from 'react';
import { Download, Upload, CheckCircle2, Cloud, HardDrive, Key, ShieldCheck } from 'lucide-react';
import { getCurrentUserId, FIREBASE_SYNC_ENABLED } from '../firebase';
import type { DayLedgerEntry, PantryItem, Benchmarks } from '../types';

interface SettingsTabProps {
  apiKey: string;
  onSetApiKey: (key: string) => void;
  cloudStatus?: 'connected' | 'syncing' | 'offline';
  ledger?: Record<string, DayLedgerEntry>;
  onRestoreLedger?: (ledger: Record<string, DayLedgerEntry>) => void;
  pantry?: PantryItem[];
  onRestorePantry?: (pantry: PantryItem[]) => void;
  benchmarks?: Benchmarks;
  onRestoreBenchmarks?: (benchmarks: Benchmarks) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  apiKey,
  onSetApiKey,
  cloudStatus = 'connected',
  ledger,
  onRestoreLedger,
  pantry,
  onRestorePantry,
  benchmarks,
  onRestoreBenchmarks,
}) => {
  const currentUid = getCurrentUserId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupToast, setBackupToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setBackupToast(msg);
    setTimeout(() => setBackupToast(null), 4000);
  };

  const handleExportBackup = () => {
    try {
      const backupPayload = {
        app: 'Health LT',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        ledger: ledger || JSON.parse(localStorage.getItem('master_ledger') || '{}'),
        pantry: pantry || JSON.parse(localStorage.getItem('user_pantry') || '[]'),
        benchmarks: benchmarks || JSON.parse(localStorage.getItem('routine_benchmarks') || '{}'),
        routine_exercises: JSON.parse(localStorage.getItem('routine_exercises_v1') || '{}')
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateTag = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `health_lt_backup_${dateTag}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      triggerToast('Backup exported successfully as JSON file!');
    } catch (err) {
      console.error('Export error:', err);
      triggerToast('Failed to export backup.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.ledger && onRestoreLedger) {
          onRestoreLedger(parsed.ledger);
        }
        if (parsed.pantry && onRestorePantry) {
          onRestorePantry(parsed.pantry);
        }
        if (parsed.benchmarks && onRestoreBenchmarks) {
          onRestoreBenchmarks(parsed.benchmarks);
        }
        if (parsed.routine_exercises) {
          localStorage.setItem('routine_exercises_v1', JSON.stringify(parsed.routine_exercises));
        }

        triggerToast('Backup restored successfully! All logs, pantry items & routines refreshed.');
      } catch (err) {
        console.error('Import parse error:', err);
        triggerToast('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-4 space-y-5 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-400" />
          <span>Storage & Cloud Sync Configuration</span>
        </h3>
        {backupToast && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/80 text-emerald-300 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{backupToast}</span>
          </div>
        )}
      </div>

      {/* Storage Status Card */}
      <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Live Storage Engine
            </div>
            <div className="text-sm font-bold text-zinc-200 font-mono flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>Firebase Cloud Firestore + Local Cache</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px] self-start sm:self-auto">
            <span
              className={`w-2 h-2 rounded-full ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-400'
                  : cloudStatus === 'syncing'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="capitalize">{cloudStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
          <div>
            <span className="text-zinc-500 block text-[10px]">AUTHENTICATED USER ID:</span>
            <span className="font-mono text-zinc-300 break-all">{currentUid || 'Connecting...'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">SECURITY SCOPE:</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Partitioned Per-User UID</span>
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans pt-1">
          Real-time cloud sync is live. Your nutrition records, shift schedules, workout routines, and pantry foods are synchronized across all your devices and cached locally for instant offline usage.
        </p>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span>Data Backup & Portability</span>
            </div>
            <div className="text-[10px] text-zinc-500">
              Export your full diary, workout logs, and custom pantry database to a portable JSON file.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import JSON Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {/* Optional Gemini API Key */}
      <div className="space-y-1.5">
        <label htmlFor="gemini_key_input" className="text-zinc-300 block font-semibold flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemini Flash API Key (Optional Client OCR & Meal Assistant)</span>
        </label>
        <input
          id="gemini_key_input"
          type="password"
          value={apiKey}
          onChange={(e) => onSetApiKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-zinc-500 font-mono"
        />
        <p className="text-[10px] text-zinc-500">
          Stored securely in device localStorage. Used for direct client-side natural language meal parsing and AI advisor. The Singapore Health Promotion Board (HPB) local engine is always active as default.
        </p>
      </div>

      {/* Monthly Shift Rotation Rules */}
      <div className="space-y-1.5 border-t border-zinc-800 pt-3">
        <span className="text-zinc-400 block font-semibold">Monthly Shift Rotation Rules</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300">
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 font-bold block">Odd Months (Sep, Nov, Jan)</span>
            <span>AM Shift: 08:30 - 21:00</span>
            <div className="text-[10px] text-zinc-500 mt-0.5">AM Work → AM Work → Standby → Rest</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-400 font-bold block">Even Months (Oct, Dec)</span>
            <span>PM Shift: 20:30 - 09:00</span>
            <div className="text-[10px] text-zinc-500 mt-0.5">PM Work → PM Work → Rest → Standby</div>
          </div>
        </div>
      </div>

      {/* Blueprint Nutritional Targets */}
      <div className="space-y-1.5 border-t border-zinc-800 pt-3">
        <span className="text-zinc-400 block font-semibold">Blueprint Nutritional Targets</span>
        <div className="grid grid-cols-2 gap-2 text-zinc-300">
          <div>
            Net Carb Soft Ceiling: <span className="text-zinc-100 font-bold">30g</span>
          </div>
          <div>
            Net Carb Hard Ceiling: <span className="text-zinc-100 font-bold">50g</span>
          </div>
          <div>
            Fiber Daily Floor: <span className="text-zinc-100 font-bold">38g</span>
          </div>
          <div>
            Protein Target Floor: <span className="text-zinc-100 font-bold">110g</span>
          </div>
          <div>
            Calorie Alert Threshold: <span className="text-rose-400 font-bold">&gt; 1500 kcal</span>
          </div>
          <div>
            Date Format: <span className="text-zinc-100 font-bold">DD-MM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
