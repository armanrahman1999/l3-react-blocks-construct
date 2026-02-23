import { Match } from './types';
import { groupMatchesByRound } from './bracket';

const isParticipant = (playerId?: string): boolean =>
  typeof playerId === 'string' && playerId.length > 0;

const applyByeIfPossible = (match: Match): Match => {
  const p1 = match.player1Id;
  const p2 = match.player2Id;

  const has1 = isParticipant(p1);
  const has2 = isParticipant(p2);

  if (has1 && !has2) {
    // auto-win for p1 if no conflicting manual winner
    if (!match.winnerId || match.winnerId === p1) {
      return { ...match, winnerId: p1, status: 'complete' };
    }
  }

  if (!has1 && has2) {
    if (!match.winnerId || match.winnerId === p2) {
      return { ...match, winnerId: p2, status: 'complete' };
    }
  }

  return match;
};

const normalizeMatchWinner = (match: Match): Match => {
  const { winnerId, player1Id, player2Id } = match;

  if (!winnerId) {
    return { ...match, status: 'pending' };
  }

  if (winnerId !== player1Id && winnerId !== player2Id) {
    return { ...match, winnerId: undefined, status: 'pending' };
  }

  return { ...match, status: 'complete' };
};

export const recomputeProgression = (matches: Match[]): Match[] => {
  const byRound = groupMatchesByRound(matches);
  const rounds = Array.from(byRound.keys()).sort((a, b) => a - b);

  if (rounds.length === 0) return [];

  // Work on copies to preserve immutability
  const updatedByRound = new Map<number, Match[]>();

  for (const r of rounds) {
    updatedByRound.set(
      r,
      (byRound.get(r) ?? []).map((m) => ({ ...m }))
    );
  }

  // Round 1: normalize + apply byes
  const round1 = updatedByRound.get(1) ?? [];

  for (let i = 0; i < round1.length; i++) {
    round1[i] = applyByeIfPossible(normalizeMatchWinner(round1[i]));
  }

  updatedByRound.set(1, round1);

  for (const r of rounds) {
    if (r === 1) continue;

    const prev = updatedByRound.get(r - 1) ?? [];
    const current = updatedByRound.get(r) ?? [];

    for (let i = 0; i < current.length; i++) {
      const prevLeft = prev[i * 2];
      const prevRight = prev[i * 2 + 1];

      const p1 = prevLeft?.winnerId;
      const p2 = prevRight?.winnerId;

      const next: Match = {
        ...current[i],
        player1Id: p1,
        player2Id: p2,
      };

      // Clear invalid winners when upstream changed
      current[i] = applyByeIfPossible(normalizeMatchWinner(next));
    }

    updatedByRound.set(r, current);
  }

  // Flatten back in round/match order
  const out: Match[] = [];

  for (const r of rounds) {
    out.push(...(updatedByRound.get(r) ?? []));
  }

  return out;
};

export const setMatchWinner = (
  matches: Match[],
  matchId: string,
  winnerId: string | undefined
): Match[] => {
  const updated = matches.map((m) => {
    if (m.id !== matchId) return m;

    const next: Match = { ...m, winnerId };

    // Winner set only if valid; normalize in recompute
    return next;
  });

  return recomputeProgression(updated);
};
