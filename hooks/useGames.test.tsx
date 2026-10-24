import { ReactNode } from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import useGames from "./useGames";
import { GamesServiceProvider } from "../context/GamesServiceContext";
import { GamesPage, GamesService } from "../services/GamesService";
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

const PAGE_SIZE = 2;
const page = (ids: number[], hasMore = ids.length === PAGE_SIZE): GamesPage => ({
  games: ids.map((id) => makeGame({ id, name: `Game ${id}` })),
  hasMore,
});

const createService = (): jest.Mocked<GamesService> => ({
  getGamesReleasingSoon: jest.fn().mockResolvedValue(page([])),
  searchUpcomingGames: jest.fn().mockResolvedValue(page([])),
  getGamesByIds: jest.fn().mockResolvedValue([]),
});

const renderUseGames = (service: GamesService, searchPhrase?: string) =>
  renderHook(({ phrase }: { phrase?: string }) => useGames(phrase, PAGE_SIZE), {
    initialProps: { phrase: searchPhrase },
    wrapper: ({ children }: { children: ReactNode }) => (
      <GamesServiceProvider service={service}>{children}</GamesServiceProvider>
    ),
  });

const ids = (games: { id: number }[]) => games.map(({ id }) => id);

beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

describe("useGames", () => {
  it("loads the first page of games releasing soon when there's no search phrase", async () => {
    const service = createService();
    service.getGamesReleasingSoon.mockResolvedValue(page([1, 2]));

    const { result } = await renderUseGames(service);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ids(result.current.games)).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
    expect(service.getGamesReleasingSoon).toHaveBeenCalledWith(
      { offset: 0, limit: PAGE_SIZE },
      expect.any(AbortSignal)
    );
    expect(service.searchUpcomingGames).not.toHaveBeenCalled();
  });

  it("searches games when a search phrase is given", async () => {
    const service = createService();
    const { result } = await renderUseGames(service, "zelda");

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(service.searchUpcomingGames).toHaveBeenCalledWith(
      "zelda",
      { offset: 0, limit: PAGE_SIZE },
      expect.any(AbortSignal)
    );
  });

  it("appends the next pages until there are no more", async () => {
    const service = createService();
    service.getGamesReleasingSoon
      .mockResolvedValueOnce(page([1, 2]))
      .mockResolvedValueOnce(page([3, 4]))
      .mockResolvedValueOnce(page([5]));
    const { result } = await renderUseGames(service);
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.hasMore).toBe(false));
    await act(async () => result.current.loadMore());

    expect(ids(result.current.games)).toEqual([1, 2, 3, 4, 5]);
    expect(service.getGamesReleasingSoon.mock.calls.map(([request]) => request)).toEqual([
      { offset: 0, limit: 2 },
      { offset: 2, limit: 2 },
      { offset: 4, limit: 2 },
    ]);
  });

  it("loads a page only once when asked repeatedly", async () => {
    const service = createService();
    const next = deferred<GamesPage>();
    service.getGamesReleasingSoon
      .mockResolvedValueOnce(page([1, 2]))
      .mockReturnValueOnce(next.promise);
    const { result } = await renderUseGames(service);
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(result.current.loadingMore).toBe(true);
    await act(async () => next.resolve(page([3])));

    expect(service.getGamesReleasingSoon).toHaveBeenCalledTimes(2);
    expect(ids(result.current.games)).toEqual([1, 2, 3]);
  });

  it("skips games that were already on an earlier page", async () => {
    const service = createService();
    service.getGamesReleasingSoon
      .mockResolvedValueOnce(page([1, 2]))
      .mockResolvedValueOnce(page([2, 3]));
    const { result } = await renderUseGames(service);
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.loadMore());

    await waitFor(() => expect(ids(result.current.games)).toEqual([1, 2, 3]));
  });

  it("keeps the loaded games and allows retrying when loading more fails", async () => {
    const service = createService();
    service.getGamesReleasingSoon
      .mockResolvedValueOnce(page([1, 2]))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(page([3]));
    const { result } = await renderUseGames(service);
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.loadMoreFailed).toBe(true));
    expect(ids(result.current.games)).toEqual([1, 2]);

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(ids(result.current.games)).toEqual([1, 2, 3]));
    expect(result.current.loadMoreFailed).toBe(false);
    expect(service.getGamesReleasingSoon.mock.calls[2][0]).toEqual({ offset: 2, limit: 2 });
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
    const slow = deferred<GamesPage>();
    service.searchUpcomingGames
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValueOnce(page([2]));

    const { result, rerender } = await renderUseGames(service, "old");
    await rerender({ phrase: "new" });
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The first request finishes last, but must not replace the newer results
    await act(async () => slow.resolve(page([1])));

    expect(ids(result.current.games)).toEqual([2]);
    const firstSignal = service.searchUpcomingGames.mock.calls[0][2];
    expect(firstSignal?.aborted).toBe(true);
  });

  it("starts over from the first page when the search changes", async () => {
    const service = createService();
    service.searchUpcomingGames
      .mockResolvedValueOnce(page([1, 2]))
      .mockResolvedValueOnce(page([3, 4]))
      .mockResolvedValueOnce(page([5, 6]));
    const { result, rerender } = await renderUseGames(service, "old");
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.games).toHaveLength(4));

    await rerender({ phrase: "new" });

    await waitFor(() => expect(ids(result.current.games)).toEqual([5, 6]));
    expect(service.searchUpcomingGames).toHaveBeenLastCalledWith(
      "new",
      { offset: 0, limit: PAGE_SIZE },
      expect.any(AbortSignal)
    );
  });
});
