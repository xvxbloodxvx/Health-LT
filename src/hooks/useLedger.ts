import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { DayLedgerEntry } from '../types';
import { SEED_LEDGER } from '../data/seedData';
import { formatDateDDMM } from '../utils/nutrition';
import { getDefaultShiftForDate } from '../utils/shift';
import {
  initAutomaticAuth,
  saveLedgerToFirestore,
  subscribeToFirestoreData
} from '../firebase';

export function useLedger(initialDate?: string) {
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(() => initialDate || getTodayISO());
  const [dashboardTimeframe, setDashboardTimeframe] = useState<'7' | '30'>('7');
  const [ledgerTimeframe, setLedgerTimeframe] = useState<'7' | '30' | 'all'>('7');
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('offline');

  const [ledger, setLedger] = useState<Record<string, DayLedgerEntry>>(() => {
    try {
      const version = localStorage.getItem('master_ledger_version');
      const saved = localStorage.getItem('master_ledger');
      if (saved && version === 'v5') {
        return JSON.parse(saved);
      }
      localStorage.setItem('master_ledger_version', 'v5');
      localStorage.setItem('master_ledger', JSON.stringify(SEED_LEDGER));
      return SEED_LEDGER;
    } catch {
      return SEED_LEDGER;
    }
  });

  const isInitialMount = useRef(true);

  // Auto-sync with Firebase in background
  useEffect(() => {
    initAutomaticAuth(() => {
      setCloudStatus('connected');
    });

    const unsubscribe = subscribeToFirestoreData({
      onLedgerUpdate: (remoteLedger) => {
        setLedger((prev) => ({ ...prev, ...(remoteLedger as Record<string, DayLedgerEntry>) }));
      },
      onSyncStatus: (st) => setCloudStatus(st)
    });

    return () => unsubscribe();
  }, []);

  // Save to LocalStorage & push to Firestore
  useEffect(() => {
    try {
      localStorage.setItem('master_ledger', JSON.stringify(ledger));
      localStorage.setItem('master_ledger_version', 'v5');
      if (!isInitialMount.current) {
        saveLedgerToFirestore(ledger);
      }
    } catch {
      // ignore
    }
    isInitialMount.current = false;
  }, [ledger]);

  // Current Day Log State
  const currentDay: DayLedgerEntry = useMemo(() => {
    const entry = ledger[selectedDate];
    const defaultShift = getDefaultShiftForDate(selectedDate);
    if (!entry) {
      return {
        weight_kg: null,
        calories: 0,
        protein: 0,
        net_carbs: 0,
        fiber: 0,
        fat: 0,
        sodium: 0,
        potassium: 0,
        magnesium: 0,
        calcium: 0,
        sleep_hours: null,
        split_sleep: 0,
        waking_count: 0,
        bm_count: 0,
        shift: defaultShift,
        meals: { meal_1: [], meal_2: [], meal_3: [] },
        workouts: {}
      };
    }
    return {
      ...entry,
      shift: entry.shift || defaultShift,
      workouts: entry.workouts || {}
    };
  }, [ledger, selectedDate]);

  // Date Navigator Helper
  const shiftDate = useCallback((days: number) => {
    setSelectedDate((prevDate) => {
      const d = new Date(prevDate);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const jumpToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const updateCurrentDay = useCallback(
    (field: keyof DayLedgerEntry, value: unknown) => {
      setLedger((prev) => ({
        ...prev,
        [selectedDate]: {
          ...(prev[selectedDate] || currentDay),
          [field]: value
        }
      }));
    },
    [selectedDate, currentDay]
  );

  const updateCurrentDayFields = useCallback(
    (fields: Partial<DayLedgerEntry>) => {
      setLedger((prev) => ({
        ...prev,
        [selectedDate]: {
          ...(prev[selectedDate] || currentDay),
          ...fields
        }
      }));
    },
    [selectedDate, currentDay]
  );

  const updateDayShift = useCallback((dateKey: string, shiftValue: string) => {
    setLedger((prev) => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        shift: shiftValue
      }
    }));
  }, []);

  // Historical Chart Data (7-day or 30-day view formatted strictly in DD-MM)
  const chartData = useMemo(() => {
    const allWeighted = Object.entries(ledger)
      .filter(([_, val]) => val.weight_kg !== null && val.weight_kg !== undefined)
      .map(([d, val]) => ({
        date: formatDateDDMM(d),
        rawDate: d,
        weight: val.weight_kg || null,
        net_carbs: val.net_carbs || 0,
        protein: val.protein || 0,
        calories: val.calories || 0,
        sleep: val.sleep_hours || null
      }))
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    if (dashboardTimeframe === '7') {
      return allWeighted.slice(-7);
    } else {
      const thirtyDaysAgo = new Date(selectedDate);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoThreshold = thirtyDaysAgo.toISOString().split('T')[0];
      const recent30Days = allWeighted.filter((item) => item.rawDate >= isoThreshold);
      return recent30Days.length >= 3 ? recent30Days : allWeighted.slice(-30);
    }
  }, [ledger, dashboardTimeframe, selectedDate]);

  // Historical rows for ledger matrix (7 days, 30 days, or all entries)
  const historicalRows = useMemo(() => {
    const entries = Object.entries(ledger).sort((a, b) => b[0].localeCompare(a[0]));
    if (ledgerTimeframe === '7') return entries.slice(0, 7);
    if (ledgerTimeframe === '30') return entries.slice(0, 30);
    return entries;
  }, [ledger, ledgerTimeframe]);

  return {
    selectedDate,
    setSelectedDate,
    shiftDate,
    jumpToToday,
    ledger,
    setLedger,
    currentDay,
    updateCurrentDay,
    updateCurrentDayFields,
    updateDayShift,
    dashboardTimeframe,
    setDashboardTimeframe,
    ledgerTimeframe,
    setLedgerTimeframe,
    chartData,
    historicalRows,
    cloudStatus
  };
}
