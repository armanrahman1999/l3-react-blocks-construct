export type TournamentPhase = 'setup' | 'bracket';

export interface TournamentMeta {
  id: string;
  name: string;
  createdAt: string;
  phase: TournamentPhase;
  completed: boolean;
}

export interface Player {
  id: string;
  name: string;
  seed: number; // 1-based seed after shuffle
}

export type MatchStatus = 'pending' | 'complete';

export interface Match {
  id: string;
  roundNumber: number; // 1-based
  matchNumber: number; // 1-based
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  status: MatchStatus;
  // score is intentionally a stub for MVP
  score?: string;
}

export interface BracketState {
  slots: number;
  roundsCount: number;
  matches: Match[];
}
