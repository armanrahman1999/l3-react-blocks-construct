import { Player, BracketState, Match } from './types';
import { buildEmptyBracket, groupMatchesByRound } from './bracket';
import { recomputeProgression } from './progression';

export interface CreateBracketArgs {
  players: Player[];
  createMatchId: (roundNumber: number, matchNumber: number) => string;
}

export const createBracket = ({ players, createMatchId }: CreateBracketArgs): BracketState => {
  const bracket = buildEmptyBracket(players.length, createMatchId);

  const byRound = groupMatchesByRound(bracket.matches);
  const round1 = byRound.get(1) ?? [];

  const slotCount = bracket.slots;

  const slots: Array<string | undefined> = Array.from(
    { length: slotCount },
    (_, i) => players[i]?.id
  );

  // Assign slots to Round 1 matches
  for (let i = 0; i < round1.length; i++) {
    const p1 = slots[i * 2];
    const p2 = slots[i * 2 + 1];

    round1[i] = {
      ...round1[i],
      player1Id: p1,
      player2Id: p2,
      winnerId: undefined,
      status: 'pending',
    };
  }

  const matches: Match[] = [];

  for (const r of Array.from(byRound.keys()).sort((a, b) => a - b)) {
    const list = byRound.get(r) ?? [];
    matches.push(...list);
  }

  // Apply byes + propagate deterministically
  const recomputed = recomputeProgression(matches);

  return {
    ...bracket,
    matches: recomputed,
  };
};
