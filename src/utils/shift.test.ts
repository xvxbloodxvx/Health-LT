import { test } from 'node:test';
import assert from 'node:assert';
import { getMonthShiftConfig, getDefaultShiftForDate, EXACT_2026_ROSTER } from './shift';

test('getMonthShiftConfig returns AM for odd months (Sep, Nov, Jan)', () => {
  assert.strictEqual(getMonthShiftConfig(9).shiftType, 'AM');
  assert.strictEqual(getMonthShiftConfig(11).shiftType, 'AM');
  assert.strictEqual(getMonthShiftConfig(1).shiftType, 'AM');
});

test('getMonthShiftConfig returns PM for even months (Oct, Dec)', () => {
  assert.strictEqual(getMonthShiftConfig(10).shiftType, 'PM');
  assert.strictEqual(getMonthShiftConfig(12).shiftType, 'PM');
});

test('getDefaultShiftForDate returns exact roster for November 2026', () => {
  // Nov 1 is OFF (Rest)
  assert.strictEqual(getDefaultShiftForDate('2026-11-01'), 'Rest');
  // Nov 2 is SB (Standby) - today's date
  assert.strictEqual(getDefaultShiftForDate('2026-11-02'), 'Standby');
  // Nov 3 is AM Work
  assert.strictEqual(getDefaultShiftForDate('2026-11-03'), 'AM Work');
  // Nov 14 has taken over swap to AM Work
  assert.strictEqual(getDefaultShiftForDate('2026-11-14'), 'AM Work');
});

test('getDefaultShiftForDate returns exact roster for October and December 2026', () => {
  // Oct 1 is SB (Standby)
  assert.strictEqual(getDefaultShiftForDate('2026-10-01'), 'Standby');
  // Oct 2 is PM Work
  assert.strictEqual(getDefaultShiftForDate('2026-10-02'), 'PM Work');
  // Dec 1 is PM Work
  assert.strictEqual(getDefaultShiftForDate('2026-12-01'), 'PM Work');
  // Dec 3 is Rest (OFF)
  assert.strictEqual(getDefaultShiftForDate('2026-12-03'), 'Rest');
});
