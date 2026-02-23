import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  BracketState,
  Match,
  Player,
  TournamentPhase,
} from '@/modules/chess-tournament/domain/types';
import { createBracket } from '@/modules/chess-tournament/domain/match-factory';
import { setMatchWinner } from '@/modules/chess-tournament/domain/progression';
import { CHESS_TOURNAMENT_STORAGE_KEY, CHESS_TOURNAMENT_STORAGE_VERSION } from './persistence';

type SeedingMode = 'random' | 'manual';

interface ChessTournamentState {
  tournamentId: string;
  tournamentName: string;
  phase: TournamentPhase;
  seedingMode: SeedingMode;

  players: Player[];
  bracket?: BracketState;

  selectedRound: number;

  // derived
  roundsCount?: number;
  champion?: Player;

  // actions
  setTournamentName: (name: string) => void;
  setSeedingMode: (mode: SeedingMode) => void;

  addPlayer: (name: string) => void;
  updatePlayer: (id: string, name: string) => void;
  deletePlayer: (id: string) => void;
  bulkAddPlayers: (names: string[]) => void;

  generateBracket: () => void;
  setSelectedRound: (roundNumber: number) => void;
  setWinner: (matchId: string, winnerId: string) => void;

  resetToSetup: () => void;
  clearAll: () => void;

  getMatchesByRound: (roundNumber: number) => Match[];
  getPlayerNameById: (id?: string) => string;
}

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalizeName = (name: string) => name.trim();

const computeChampion = (players: Player[], matches: Match[] | undefined): Player | undefined => {
  if (!matches || matches.length === 0) return undefined;
  const finals = matches.reduce<Match | undefined>((acc, m) => {
    if (!acc) return m;
    if (m.roundNumber > acc.roundNumber) return m;
    return acc;
  }, undefined);

  if (!finals?.winnerId) return undefined;
  return players.find((p) => p.id === finals.winnerId);
};

export const useChessTournamentStore = create<ChessTournamentState>()(
  persist(
    (set, get) => ({
      tournamentId: uuidv4(),
      tournamentName: '',
      phase: 'setup',
      seedingMode: 'random',

      players: [],
      bracket: undefined,
      selectedRound: 1,

      roundsCount: undefined,
      champion: undefined,

      setTournamentName: (name) => set({ tournamentName: name }),

      setSeedingMode: (mode) => set({ seedingMode: mode }),

      addPlayer: (name) => {
        const trimmed = normalizeName(name);
        if (!trimmed) return;

        const state = get();
        const nextPlayers = [
          ...state.players,
          { id: uuidv4(), name: trimmed, seed: state.players.length + 1 },
        ];
        // MVP behavior: editing players after generation resets bracket
        set({
          players: nextPlayers,
          phase: 'setup',
          bracket: undefined,
          roundsCount: undefined,
          selectedRound: 1,
          champion: undefined,
        });
      },

      updatePlayer: (id, name) => {
        const trimmed = normalizeName(name);
        if (!trimmed) return;

        const state = get();
        const nextPlayers = state.players.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
        set({
          players: nextPlayers,
          phase: 'setup',
          bracket: undefined,
          roundsCount: undefined,
          selectedRound: 1,
          champion: undefined,
        });
      },

      deletePlayer: (id) => {
        const state = get();
        const nextPlayers = state.players
          .filter((p) => p.id !== id)
          .map((p, idx) => ({ ...p, seed: idx + 1 }));
        set({
          players: nextPlayers,
          phase: 'setup',
          bracket: undefined,
          roundsCount: undefined,
          selectedRound: 1,
          champion: undefined,
        });
      },

      bulkAddPlayers: (names) => {
        const normalized = names.map(normalizeName).filter(Boolean);
        if (normalized.length === 0) return;

        const state = get();
        const nextPlayers = [
          ...state.players,
          ...normalized.map((n, idx) => ({
            id: uuidv4(),
            name: n,
            seed: state.players.length + idx + 1,
          })),
        ];
        set({
          players: nextPlayers,
          phase: 'setup',
          bracket: undefined,
          roundsCount: undefined,
          selectedRound: 1,
          champion: undefined,
        });
      },

      generateBracket: () => {
        const state = get();
        if (state.players.length < 2) return;

        const seeded =
          state.seedingMode === 'random'
            ? shuffle(state.players).map((p, idx) => ({ ...p, seed: idx + 1 }))
            : state.players.map((p, idx) => ({ ...p, seed: idx + 1 }));

        const bracket = createBracket({
          players: seeded,
          createMatchId: (r, m) => `r${r}-m${m}`,
        });

        const roundsCount = bracket.roundsCount;
        set({
          players: seeded,
          bracket,
          roundsCount,
          phase: 'bracket',
          selectedRound: 1,
          champion: computeChampion(seeded, bracket.matches),
        });
      },

      setSelectedRound: (roundNumber) => {
        const state = get();
        const max = state.roundsCount ?? 1;
        const clamped = Math.min(Math.max(1, roundNumber), max);
        set({ selectedRound: clamped });
      },

      setWinner: (matchId, winnerId) => {
        const state = get();
        if (!state.bracket) return;

        const updatedMatches = setMatchWinner(state.bracket.matches, matchId, winnerId);
        const updatedBracket: BracketState = { ...state.bracket, matches: updatedMatches };

        set({
          bracket: updatedBracket,
          champion: computeChampion(state.players, updatedMatches),
        });
      },

      resetToSetup: () => {
        const state = get();
        set({
          phase: 'setup',
          bracket: undefined,
          roundsCount: undefined,
          selectedRound: 1,
          champion: undefined,
          // keep players + tournament name
          players: state.players.map((p, idx) => ({ ...p, seed: idx + 1 })),
        });
      },

      clearAll: () =>
        set({
          tournamentId: uuidv4(),
          tournamentName: '',
          phase: 'setup',
          seedingMode: 'random',
          players: [],
          bracket: undefined,
          roundsCount: undefined,
          selectedRound: 1,
          champion: undefined,
        }),

      getMatchesByRound: (roundNumber) => {
        const state = get();
        const matches = state.bracket?.matches ?? [];
        return matches
          .filter((m) => m.roundNumber === roundNumber)
          .sort((a, b) => a.matchNumber - b.matchNumber);
      },

      getPlayerNameById: (id) => {
        if (!id) return '';
        const state = get();
        return state.players.find((p) => p.id === id)?.name ?? '';
      },
    }),
    {
      name: CHESS_TOURNAMENT_STORAGE_KEY,
      version: CHESS_TOURNAMENT_STORAGE_VERSION,
      // migration stub: return previous state by default
      migrate: (persistedState) => persistedState as ChessTournamentState,
      partialize: (state) => ({
        tournamentId: state.tournamentId,
        tournamentName: state.tournamentName,
        phase: state.phase,
        seedingMode: state.seedingMode,
        players: state.players,
        bracket: state.bracket,
        selectedRound: state.selectedRound,
        roundsCount: state.roundsCount,
        champion: state.champion,
      }),
    }
  )
);
