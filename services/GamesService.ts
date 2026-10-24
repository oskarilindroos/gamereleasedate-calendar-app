import { Game } from "../types/games";
import { PageRequest } from "./igdb/queries";

export type { PageRequest };

export interface GamesPage {
  games: Game[];
  // Whether requesting the next page can return more games
  hasMore: boolean;
}

// Data source for games, so that screens don't depend on IGDB directly
// and tests can provide their own implementation.
export interface GamesService {
  getGamesReleasingSoon(page: PageRequest, signal?: AbortSignal): Promise<GamesPage>;
  searchUpcomingGames(
    searchPhrase: string,
    page: PageRequest,
    signal?: AbortSignal
  ): Promise<GamesPage>;
  getGamesByIds(ids: number[], signal?: AbortSignal): Promise<Game[]>;
}
