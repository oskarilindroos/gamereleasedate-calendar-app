import { Game } from "../types/games";

// Data source for games, so that screens don't depend on IGDB directly
// and tests can provide their own implementation.
export interface GamesService {
  getGamesReleasingSoon(signal?: AbortSignal): Promise<Game[]>;
  searchUpcomingGames(searchPhrase: string, signal?: AbortSignal): Promise<Game[]>;
}
