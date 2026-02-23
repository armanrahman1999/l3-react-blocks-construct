import { describe, expect, test } from 'vitest';
import type { Player } from './types';
import { createBracket } from './match-factory';
import { setMatchWinner } from './progression';

const makePlayers = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `P${i + 1}`, seed: i + 1 }));

describe('progression + byes', () => {
  test('AT-1: 8 players bracket shape and progression', () => {
    const bracket = createBracket({
      players: makePlayers(8),
      createMatchId: (r, m) => `r${r}-m${m}`,
    });

    expect(bracket.roundsCount).toBe(3);

    const round1 = bracket.matches.filter((m) => m.roundNumber === 1);
    const round2 = bracket.matches.filter((m) => m.roundNumber === 2);
    const round3 = bracket.matches.filter((m) => m.roundNumber === 3);

    expect(round1).toHaveLength(4);
    expect(round2).toHaveLength(2);
    expect(round3).toHaveLength(1);

    // Set winners for round 1
    let matches = bracket.matches;
    matches = setMatchWinner(matches, 'r1-m1', round1[0].player1Id!);
    matches = setMatchWinner(matches, 'r1-m2', round1[1].player1Id!);
    matches = setMatchWinner(matches, 'r1-m3', round1[2].player1Id!);
    matches = setMatchWinner(matches, 'r1-m4', round1[3].player1Id!);

    const r2m1 = matches.find((m) => m.id === 'r2-m1')!;
    const r2m2 = matches.find((m) => m.id === 'r2-m2')!;
    expect(r2m1.player1Id).toBeDefined();
    expect(r2m1.player2Id).toBeDefined();
    expect(r2m2.player1Id).toBeDefined();
    expect(r2m2.player2Id).toBeDefined();

    // Advance to finals
    matches = setMatchWinner(matches, 'r2-m1', r2m1.player1Id!);
    matches = setMatchWinner(matches, 'r2-m2', r2m2.player1Id!);

    const finals = matches.find((m) => m.id === 'r3-m1')!;
    expect(finals.player1Id).toBeDefined();
    expect(finals.player2Id).toBeDefined();
  });

  test('AT-2: 10 players byes auto-advance and fill round 2', () => {
    const bracket = createBracket({
      players: makePlayers(10),
      createMatchId: (r, m) => `r${r}-m${m}`,
    });

    expect(bracket.roundsCount).toBe(4);

    const round1 = bracket.matches.filter((m) => m.roundNumber === 1);
    expect(round1).toHaveLength(8);

    // There should be 6 byes (16 slots - 10 players)
    const byeMatches = round1.filter(
      (m) => (Boolean(m.player1Id) && !m.player2Id) || (!m.player1Id && Boolean(m.player2Id))
    );
    expect(byeMatches).toHaveLength(6);
    byeMatches.forEach((m) => {
      expect(m.status).toBe('complete');
      expect(m.winnerId).toBeDefined();
    });

    // Round 2 should have some participants already filled from byes
    const round2 = bracket.matches.filter((m) => m.roundNumber === 2);
    expect(round2).toHaveLength(4);

    const filledSlots = round2.reduce(
      (acc, m) => acc + (m.player1Id ? 1 : 0) + (m.player2Id ? 1 : 0),
      0
    );
    expect(filledSlots).toBeGreaterThan(0);
  });

  test('changing earlier winner clears downstream and recomputes', () => {
    const bracket = createBracket({
      players: makePlayers(8),
      createMatchId: (r, m) => `r${r}-m${m}`,
    });

    let matches = bracket.matches;

    const r1m1 = matches.find((m) => m.id === 'r1-m1')!;
    const r1m2 = matches.find((m) => m.id === 'r1-m2')!;
    matches = setMatchWinner(matches, 'r1-m1', r1m1.player1Id!);
    matches = setMatchWinner(matches, 'r1-m2', r1m2.player1Id!);

    const r2m1Before = matches.find((m) => m.id === 'r2-m1')!;
    expect(r2m1Before.player1Id).toBe(r1m1.player1Id);
    expect(r2m1Before.player2Id).toBe(r1m2.player1Id);

    // Set round 2 winner, then change round 1 winner and ensure r2 winner resets
    matches = setMatchWinner(matches, 'r2-m1', r2m1Before.player1Id!);
    matches = setMatchWinner(matches, 'r1-m1', r1m1.player2Id!);

    const r2m1After = matches.find((m) => m.id === 'r2-m1')!;
    expect(r2m1After.player1Id).toBe(r1m1.player2Id);
    // winner should be cleared because participants changed
    expect(r2m1After.winnerId).toBeUndefined();
    expect(r2m1After.status).toBe('pending');
  });
});
