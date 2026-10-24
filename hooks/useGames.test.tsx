import { ReactNode } from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import useGames from "./useGames";
import { GamesServiceProvider } from "../context/GamesServiceContext";
import { GamesService } from "../services/GamesService";
import { Game } from "../types/games";
import { makeGame } from "../test/fixtures";

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const createService = (): jest.Mocked<GamesService> => ({
  getGamesReleasingSoon: jest.fn().mockResolvedValue([]),
  searchUpcomingGames: jest.fn().mockResolvedValue([]),
});

const renderUseGames = (service: GamesService, searchPhrase?: string) =>
  renderHook(({ phrase }: { phrase?: string }) => useGames(phrase), {
    initialProps: { phrase: searchPhrase },
    wrapper: ({ children }: { children: ReactNode }) => (
      <GamesServiceProvider service={service}>{children}</GamesServiceProvider>
    ),
  });

beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

describe("useGames", () => {
  it("loads the games releasing soon when there's no search phrase", async () => {
    const service = createService();
    const games = [makeGame()];
    service.getGamesReleasingSoon.mockResolvedValue(games);

    const { result } = await renderUseGames(service);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ games, loading: false, error: null });
    expect(service.searchUpcomingGames).not.toHaveBeenCalled();
  });

  it("searches games when a search phrase is given", async () => {
    const service = createService();
    const { result } = await renderUseGames(service, "zelda");

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(service.searchUpcomingGames).toHaveBeenCalledWith(
      "zelda",
      expect.any(AbortSignal)
    );
  });

  it("reports an error when loading fails", async () => {
    const service = createService();
    service.getGamesReleasingSoon.mockRejectedValue(new Error("offline"));

    const { result } = await renderUseGames(service);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.games).toEqual([]);
    expect(result.current.error).toMatch(/Error fetching games/);
  });

  it("ignores outdated responses when the search changes", async () => {
    const service = createService();
    const slow = deferred<Game[]>();
    service.searchUpcomingGames
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValueOnce([makeGame({ id: 2, name: "Newer" })]);

    const { result, rerender } = await renderUseGames(service, "old");
    await rerender({ phrase: "new" });
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The first request finishes last, but must not replace the newer results
    await act(async () => slow.resolve([makeGame({ name: "Outdated" })]));

    expect(result.current.games.map((game) => game.name)).toEqual(["Newer"]);
    const firstSignal = service.searchUpcomingGames.mock.calls[0][1];
    expect(firstSignal?.aborted).toBe(true);
  });
});
