import { BracketState, Match } from './types';

export const nextPowerOfTwo = (n: number): number => {
  if (n <= 1) return 1;

  let p = 1;
  while (p < n) p *= 2;

  return p;
};

export const getRoundsCount = (playerCount: number): number => {
  const slots = nextPowerOfTwo(playerCount);

  // slots is power of 2, rounds = log2(slots)
  return Math.max(0, Math.log2(slots));
};

export const getMatchesPerRound = (slots: number, roundNumber: number): number => {
  // roundNumber is 1-based
  if (roundNumber < 1) return 0;

  return Math.max(0, slots / Math.pow(2, roundNumber));
};

export const getTotalMatches = (slots: number): number => {
  // For power-of-two bracket, total matches = slots - 1
  return Math.max(0, slots - 1);
};

export const getNextMatchSlot = (roundNumber: number, matchNumber: number) => {
  // roundNumber and matchNumber are 1-based
  return {
    roundNumber: roundNumber + 1,
    matchNumber: Math.floor((matchNumber - 1) / 2) + 1,
    slot: (matchNumber - 1) % 2 === 0 ? 1 : 2,
  } as const;
};

export const groupMatchesByRound = (matches: Match[]): Map<number, Match[]> => {
  const map = new Map<number, Match[]>();

  for (const m of matches) {
    const list = map.get(m.roundNumber) ?? [];
    list.push(m);
    map.set(m.roundNumber, list);
  }

  for (const [round, list] of map.entries()) {
    list.sort((a, b) => a.matchNumber - b.matchNumber);
    map.set(round, list);
  }

  return map;
};

export const buildEmptyBracket = (
  playerCount: number,
  createMatchId: (r: number, m: number) => string
): BracketState => {
  const slots = nextPowerOfTwo(playerCount);
  const roundsCount = getRoundsCount(playerCount);

  const matches: Match[] = [];

  for (let r = 1; r <= roundsCount; r++) {
    const matchesInRound = getMatchesPerRound(slots, r);

    for (let m = 1; m <= matchesInRound; m++) {
      matches.push({
        id: createMatchId(r, m),
        roundNumber: r,
        matchNumber: m,
        status: 'pending',
      });
    }
  }

  return {
    slots,
    roundsCount,
    matches,
  };
};
