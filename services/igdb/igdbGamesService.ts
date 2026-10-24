import { IgdbGame } from "../../types/games";
import { GamesPage, GamesService } from "../GamesService";
import { DAY_IN_SECONDS, toUnixSeconds } from "../../utils/dates";
import { mapIgdbGame } from "./mapGame";
import {
  gamesByIdsQuery,
  gamesReleasingBetweenQuery,
  PageRequest,
  searchUpcomingGamesQuery,
} from "./queries";
import { TokenProvider } from "./twitchTokenProvider";

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface IgdbGamesServiceOptions {
  apiURL: string;
  imageURL: string;
  clientId: string;
  tokenProvider: TokenProvider;
  fetchFn?: typeof fetch;
  now?: () => Date;
}

const RELEASING_SOON_DAYS = 30;

export const createIgdbGamesService = ({
  apiURL,
  imageURL,
  clientId,
  tokenProvider,
  fetchFn = fetch,
  now = () => new Date(),
}: IgdbGamesServiceOptions): GamesService => {
  const post = async (body: string, signal?: AbortSignal) => {
    const token = await tokenProvider.getToken();
    return fetchFn(`${apiURL}/games`, {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body,
      signal,
    });
  };

  const queryGames = async (body: string, signal?: AbortSignal) => {
    let response = await post(body, signal);

    // The cached token may have been revoked; fetch a new one and retry once
    if (response.status === 401) {
      tokenProvider.invalidate();
      response = await post(body, signal);
    }

    if (!response.ok) {
      throw new ApiError(
        `IGDB request failed (${response.status})`,
        response.status
      );
    }

    const games: IgdbGame[] = await response.json();
    return games;
  };

  const toAppGames = (games: IgdbGame[]) =>
    games
      .filter((game) => typeof game.first_release_date === "number")
      .map((game) => mapIgdbGame(game, imageURL));

  const queryPage = async (
    body: string,
    page: PageRequest,
    signal?: AbortSignal
  ): Promise<GamesPage> => {
    const games = await queryGames(body, signal);
    // A full page means there may be more; count before dropping undated games
    return { games: toAppGames(games), hasMore: games.length >= page.limit };
  };

  return {
    getGamesReleasingSoon(page, signal) {
      const nowUnix = toUnixSeconds(now());
      return queryPage(
        gamesReleasingBetweenQuery(
          nowUnix,
          nowUnix + RELEASING_SOON_DAYS * DAY_IN_SECONDS,
          page
        ),
        page,
        signal
      );
    },
    searchUpcomingGames(searchPhrase, page, signal) {
      return queryPage(
        searchUpcomingGamesQuery(searchPhrase, toUnixSeconds(now()), page),
        page,
        signal
      );
    },
    async getGamesByIds(ids, signal) {
      if (ids.length === 0) return [];
      return toAppGames(await queryGames(gamesByIdsQuery(ids), signal));
    },
  };
};
