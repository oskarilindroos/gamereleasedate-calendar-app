import { useCallback, useEffect, useRef, useState } from "react";
import { useGamesService } from "../context/GamesServiceContext";
import { Game } from "../types/games";

export const PAGE_SIZE = 30;

interface GamesState {
  games: Game[];
  // First page
  loading: boolean;
  error: string | null;
  // Following pages
  loadingMore: boolean;
  loadMoreFailed: boolean;
  hasMore: boolean;
  nextOffset: number;
}

const LOADING: GamesState = {
  games: [],
  loading: true,
  error: null,
  loadingMore: false,
  loadMoreFailed: false,
  hasMore: false,
  nextOffset: 0,
};

// Offset pages of games with the same release date can overlap if IGDB orders
// them differently between requests, so skip games that are already listed
const appendNew = (games: Game[], page: Game[]) => {
  const ids = new Set(games.map(({ id }) => id));
  return [...games, ...page.filter(({ id }) => !ids.has(id))];
};

// Loads upcoming games matching the search phrase, or the games releasing soon
// when there is no search phrase, one page at a time.
const useGames = (searchPhrase?: string, pageSize = PAGE_SIZE) => {
  const gamesService = useGamesService();
  const [state, setState] = useState<GamesState>(LOADING);

  // Reset to the loading state as soon as the search changes
  const [loadedPhrase, setLoadedPhrase] = useState(searchPhrase);
  if (loadedPhrase !== searchPhrase) {
    setLoadedPhrase(searchPhrase);
    setState(LOADING);
  }

  // Aborted when the search changes, so slow, outdated responses can't
  // overwrite newer results
  const controllerRef = useRef<AbortController | null>(null);
  // Set synchronously so a burst of onEndReached calls loads a page only once
  const loadingMoreRef = useRef(false);

  const fetchPage = useCallback(
    (offset: number, signal: AbortSignal) => {
      const page = { offset, limit: pageSize };
      return searchPhrase
        ? gamesService.searchUpcomingGames(searchPhrase, page, signal)
        : gamesService.getGamesReleasingSoon(page, signal);
    },
    [gamesService, searchPhrase, pageSize]
  );

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    loadingMoreRef.current = false;

    fetchPage(0, controller.signal)
      .then(({ games, hasMore }) => {
        if (controller.signal.aborted) return;
        setState({ ...LOADING, games, hasMore, loading: false, nextOffset: pageSize });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn("Fetching games failed", error);
        setState({
          ...LOADING,
          loading: false,
          error: "Error fetching games. Please try again later.",
        });
      });

    return () => controller.abort();
  }, [fetchPage, pageSize]);

  const { loading, hasMore, nextOffset } = state;

  const loadMore = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || loading || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setState((current) => ({ ...current, loadingMore: true, loadMoreFailed: false }));

    fetchPage(nextOffset, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          games: appendNew(current.games, page.games),
          hasMore: page.hasMore,
          nextOffset: current.nextOffset + pageSize,
          loadingMore: false,
        }));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn("Fetching more games failed", error);
        setState((current) => ({ ...current, loadingMore: false, loadMoreFailed: true }));
      })
      .finally(() => {
        if (!controller.signal.aborted) loadingMoreRef.current = false;
      });
  }, [fetchPage, loading, hasMore, nextOffset, pageSize]);

  const { games, error, loadingMore, loadMoreFailed } = state;
  return { games, loading, error, loadingMore, loadMoreFailed, hasMore, loadMore };
};

export default useGames;
