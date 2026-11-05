/**
 * Official 2026 Shift Schedule (as of 31 August 2026, with 14 Nov swap to AM Work):
 *
 * September 2026:
 * - 01: PM, 02: SB, 03: OFF, 04-05: AM, 06: SB, 07: OFF, 08-09: AM, 10: SB, 11: OFF,
 * - 12-13: AM, 14: SB, 15: OFF, 16-17: AM, 18: SB, 19: OFF, 20-21: AM, 22: SB, 23: OFF,
 * - 24-25: AM, 26: SB, 27: OFF, 28-29: AM, 30: OFF
 *
 * October 2026:
 * - 01: SB, 02-03: PM, 04: OFF, 05: SB, 06-07: PM, 08: OFF, 09: SB, 10-11: PM, 12: OFF,
 * - 13: SB, 14-15: PM, 16: OFF, 17: SB, 18-19: PM, 20: OFF, 21: SB, 22-23: PM, 24: OFF,
 * - 25: SB, 26-27: PM, 28: OFF, 29: SB, 30-31: PM
 *
 * November 2026:
 * - 01: OFF, 02: SB, 03-04: AM, 05: SB, 06: OFF, 07-08: AM, 09: SB, 10: OFF,
 * - 11-12: AM, 13: SB, 14: AM (swapped from OFF), 15-16: AM, 17: SB, 18: OFF,
 * - 19-20: AM, 21: SB, 22: OFF, 23-24: AM, 25: SB, 26: OFF, 27-28: AM, 29: SB, 30: OFF
 *
 * December 2026:
 * - 01-02: PM, 03: OFF, 04: SB, 05-06: PM, 07: OFF, 08: SB, 09-10: PM, 11: OFF,
 * - 12: SB, 13-14: PM, 15: OFF, 16: SB, 17-18: PM, 19: OFF, 20: SB, 21-22: PM, 23: OFF,
 * - 24: SB, 25-26: PM, 27: OFF, 28: SB, 29-30: PM, 31: SB
 */

export interface MonthShiftConfig {
  shiftType: 'AM' | 'PM';
  hours: string;
  patternDescription: string;
}

export const EXACT_2026_ROSTER: Record<string, string> = {
  // September 2026
  '2026-09-01': 'PM Work',
  '2026-09-02': 'Standby',
  '2026-09-03': 'Rest',
  '2026-09-04': 'AM Work',
  '2026-09-05': 'AM Work',
  '2026-09-06': 'Standby',
  '2026-09-07': 'Rest',
  '2026-09-08': 'AM Work',
  '2026-09-09': 'AM Work',
  '2026-09-10': 'Standby',
  '2026-09-11': 'Rest',
  '2026-09-12': 'AM Work',
  '2026-09-13': 'AM Work',
  '2026-09-14': 'Standby',
  '2026-09-15': 'Rest',
  '2026-09-16': 'AM Work',
  '2026-09-17': 'AM Work',
  '2026-09-18': 'Standby',
  '2026-09-19': 'Rest',
  '2026-09-20': 'AM Work',
  '2026-09-21': 'AM Work',
  '2026-09-22': 'Standby',
  '2026-09-23': 'Rest',
  '2026-09-24': 'AM Work',
  '2026-09-25': 'AM Work',
  '2026-09-26': 'Standby',
  '2026-09-27': 'Rest',
  '2026-09-28': 'AM Work',
  '2026-09-29': 'AM Work',
  '2026-09-30': 'Rest',

  // October 2026
  '2026-10-01': 'Standby',
  '2026-10-02': 'PM Work',
  '2026-10-03': 'PM Work',
  '2026-10-04': 'Rest',
  '2026-10-05': 'Standby',
  '2026-10-06': 'PM Work',
  '2026-10-07': 'PM Work',
  '2026-10-08': 'Rest',
  '2026-10-09': 'Standby',
  '2026-10-10': 'PM Work',
  '2026-10-11': 'PM Work',
  '2026-10-12': 'Rest',
  '2026-10-13': 'Standby',
  '2026-10-14': 'PM Work',
  '2026-10-15': 'PM Work',
  '2026-10-16': 'Rest',
  '2026-10-17': 'Standby',
  '2026-10-18': 'PM Work',
  '2026-10-19': 'PM Work',
  '2026-10-20': 'Rest',
  '2026-10-21': 'Standby',
  '2026-10-22': 'PM Work',
  '2026-10-23': 'PM Work',
  '2026-10-24': 'Rest',
  '2026-10-25': 'Standby',
  '2026-10-26': 'PM Work',
  '2026-10-27': 'PM Work',
  '2026-10-28': 'Rest',
  '2026-10-29': 'Standby',
  '2026-10-30': 'PM Work',
  '2026-10-31': 'PM Work',

  // November 2026
  '2026-11-01': 'Rest',
  '2026-11-02': 'Standby', // Today's date!
  '2026-11-03': 'AM Work',
  '2026-11-04': 'AM Work',
  '2026-11-05': 'Standby',
  '2026-11-06': 'Rest',
  '2026-11-07': 'AM Work',
  '2026-11-08': 'AM Work',
  '2026-11-09': 'Standby',
  '2026-11-10': 'Rest',
  '2026-11-11': 'AM Work',
  '2026-11-12': 'AM Work',
  '2026-11-13': 'Standby',
  '2026-11-14': 'AM Work', // Taken over as AM Shift!
  '2026-11-15': 'AM Work',
  '2026-11-16': 'AM Work',
  '2026-11-17': 'Standby',
  '2026-11-18': 'Rest',
  '2026-11-19': 'AM Work',
  '2026-11-20': 'AM Work',
  '2026-11-21': 'Standby',
  '2026-11-22': 'Rest',
  '2026-11-23': 'AM Work',
  '2026-11-24': 'AM Work',
  '2026-11-25': 'Standby',
  '2026-11-26': 'Rest',
  '2026-11-27': 'AM Work',
  '2026-11-28': 'AM Work',
  '2026-11-29': 'Standby',
  '2026-11-30': 'Rest',

  // December 2026
  '2026-12-01': 'PM Work',
  '2026-12-02': 'PM Work',
  '2026-12-03': 'Rest',
  '2026-12-04': 'Standby',
  '2026-12-05': 'PM Work',
  '2026-12-06': 'PM Work',
  '2026-12-07': 'Rest',
  '2026-12-08': 'Standby',
  '2026-12-09': 'PM Work',
  '2026-12-10': 'PM Work',
  '2026-12-11': 'Rest',
  '2026-12-12': 'Standby',
  '2026-12-13': 'PM Work',
  '2026-12-14': 'PM Work',
  '2026-12-15': 'Rest',
  '2026-12-16': 'Standby',
  '2026-12-17': 'PM Work',
  '2026-12-18': 'PM Work',
  '2026-12-19': 'Rest',
  '2026-12-20': 'Standby',
  '2026-12-21': 'PM Work',
  '2026-12-22': 'PM Work',
  '2026-12-23': 'Rest',
  '2026-12-24': 'Standby',
  '2026-12-25': 'PM Work',
  '2026-12-26': 'PM Work',
  '2026-12-27': 'Rest',
  '2026-12-28': 'Standby',
  '2026-12-29': 'PM Work',
  '2026-12-30': 'PM Work',
  '2026-12-31': 'Standby',
};

export function getMonthShiftConfig(monthNumber: number): MonthShiftConfig {
  // 1-indexed month (1 = Jan, ..., 12 = Dec)
  const isOdd = monthNumber % 2 !== 0;

  if (isOdd) {
    return {
      shiftType: 'AM',
      hours: '08:30 - 21:00',
      patternDescription: 'AM Work / Standby / Rest'
    };
  } else {
    return {
      shiftType: 'PM',
      hours: '20:30 - 09:00',
      patternDescription: 'PM Work / Standby / Rest'
    };
  }
}

/**
 * Derives the default shift for a given YYYY-MM-DD date based on the official roster,
 * or general monthly pattern if outside pre-seeded 2026 range.
 */
export function getDefaultShiftForDate(dateStr: string): string {
  if (EXACT_2026_ROSTER[dateStr]) {
    return EXACT_2026_ROSTER[dateStr];
  }

  const parts = dateStr.split('-');
  if (parts.length < 3) return 'Rest';

  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const isOdd = month % 2 !== 0;

  if (isOdd) {
    const cycle = ['AM Work', 'AM Work', 'Standby', 'Rest'];
    return cycle[(day - 1) % 4] || 'Rest';
  } else {
    const cycle = ['PM Work', 'PM Work', 'Rest', 'Standby'];
    return cycle[(day - 1) % 4] || 'Rest';
  }
}
