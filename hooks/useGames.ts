import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useGamesService } from "../context/GamesServiceContext";
import { queryKeys } from "../services/query/queryClient";
import { Game } from "../types/games";

export const PAGE_SIZE = 30;

// Offset pages of games with the same release date can overlap if IGDB orders
// them differently between requests, so skip games that are already listed
const uniqueById = (games: Game[]) => {
  const seen = new Set<number>();
  return games.filter(({ id }) => !seen.has(id) && seen.add(id));
};

// Loads upcoming games matching the search phrase, or the games releasing soon
// when there is no search phrase, one page at a time.
const useGames = (searchPhrase?: string, pageSize = PAGE_SIZE) => {
  const gamesService = useGamesService();

  const query = useInfiniteQuery({
    queryKey: [...queryKeys.games(searchPhrase), pageSize],
    queryFn: ({ pageParam, signal }) => {
      const page = { offset: pageParam, limit: pageSize };
      return searchPhrase
        ? gamesService.searchUpcomingGames(searchPhrase, page, signal)
        : gamesService.getGamesReleasingSoon(page, signal);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastOffset) =>
      lastPage.hasMore ? lastOffset + pageSize : undefined,
  });

  const { data, fetchNextPage, hasNextPage } = query;
  const games = useMemo(
    () => uniqueById(data?.pages.flatMap((page) => page.games) ?? []),
    [data]
  );

  const loadMore = useCallback(() => {
    // Ignored while a page is already loading, so repeated onEndReached calls are fine
    if (hasNextPage) fetchNextPage({ cancelRefetch: false });
  }, [hasNextPage, fetchNextPage]);

  return {
    games,
    loading: query.isPending,
    error: query.isError && !data ? "Error fetching games. Please try again later." : null,
    loadingMore: query.isFetchingNextPage,
    loadMoreFailed: query.isFetchNextPageError,
    hasMore: hasNextPage,
    loadMore,
  };
};

export default useGames;
