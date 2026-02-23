import { describe, expect, test } from 'vitest';
import { getMatchesPerRound, getRoundsCount, nextPowerOfTwo, getNextMatchSlot } from './bracket';

describe('bracket utils', () => {
  test('nextPowerOfTwo', () => {
    expect(nextPowerOfTwo(1)).toBe(1);
    expect(nextPowerOfTwo(2)).toBe(2);
    expect(nextPowerOfTwo(3)).toBe(4);
    expect(nextPowerOfTwo(8)).toBe(8);
    expect(nextPowerOfTwo(10)).toBe(16);
  });

  test('rounds count', () => {
    expect(getRoundsCount(1)).toBe(0);
    expect(getRoundsCount(2)).toBe(1);
    expect(getRoundsCount(3)).toBe(2);
    expect(getRoundsCount(8)).toBe(3);
    expect(getRoundsCount(10)).toBe(4);
  });

  test('matches per round for 16 slots', () => {
    expect(getMatchesPerRound(16, 1)).toBe(8);
    expect(getMatchesPerRound(16, 2)).toBe(4);
    expect(getMatchesPerRound(16, 3)).toBe(2);
    expect(getMatchesPerRound(16, 4)).toBe(1);
  });

  test('progression mapping', () => {
    expect(getNextMatchSlot(1, 1)).toEqual({ roundNumber: 2, matchNumber: 1, slot: 1 });
    expect(getNextMatchSlot(1, 2)).toEqual({ roundNumber: 2, matchNumber: 1, slot: 2 });
    expect(getNextMatchSlot(2, 3)).toEqual({ roundNumber: 3, matchNumber: 2, slot: 1 });
    expect(getNextMatchSlot(2, 4)).toEqual({ roundNumber: 3, matchNumber: 2, slot: 2 });
  });
});
