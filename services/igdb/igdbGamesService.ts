import { IgdbGame } from "../../types/games";
import { GamesService } from "../GamesService";
import { DAY_IN_SECONDS, toUnixSeconds } from "../../utils/dates";
import { mapIgdbGame } from "./mapGame";
import { gamesReleasingBetweenQuery, searchUpcomingGamesQuery } from "./queries";
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
    return games
      .filter((game) => typeof game.first_release_date === "number")
      .map((game) => mapIgdbGame(game, imageURL));
  };

  return {
    getGamesReleasingSoon(signal) {
      const nowUnix = toUnixSeconds(now());
      return queryGames(
        gamesReleasingBetweenQuery(
          nowUnix,
          nowUnix + RELEASING_SOON_DAYS * DAY_IN_SECONDS
        ),
        signal
      );
    },
    searchUpcomingGames(searchPhrase, signal) {
      return queryGames(
        searchUpcomingGamesQuery(searchPhrase, toUnixSeconds(now())),
        signal
      );
    },
  };
};
