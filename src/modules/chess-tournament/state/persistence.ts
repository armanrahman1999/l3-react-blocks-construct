export const CHESS_TOURNAMENT_STORAGE_KEY = 'construct::chessTournament::v1';

export const CHESS_TOURNAMENT_STORAGE_VERSION = 1;

export const clearChessTournamentStorage = (): void => {
  try {
    window.localStorage.removeItem(CHESS_TOURNAMENT_STORAGE_KEY);
  } catch {
    // ignore
  }
};
