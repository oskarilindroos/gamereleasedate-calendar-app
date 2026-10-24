import { useEffect, useState } from "react";
import { useGamesService } from "../context/GamesServiceContext";
import { Game } from "../types/games";

interface GamesState {
  games: Game[];
  loading: boolean;
  error: string | null;
}

const LOADING: GamesState = { games: [], loading: true, error: null };

// Loads upcoming games matching the search phrase, or the games releasing soon
// when there is no search phrase.
const useGames = (searchPhrase?: string): GamesState => {
  const gamesService = useGamesService();
  const [state, setState] = useState<GamesState>(LOADING);

  // Reset to the loading state as soon as the search changes
  const [loadedPhrase, setLoadedPhrase] = useState(searchPhrase);
  if (loadedPhrase !== searchPhrase) {
    setLoadedPhrase(searchPhrase);
    setState(LOADING);
  }

  useEffect(() => {
    // Abort the previous request when the search changes so a slow, outdated
    // response can't overwrite newer results
    const controller = new AbortController();

    const request = searchPhrase
      ? gamesService.searchUpcomingGames(searchPhrase, controller.signal)
      : gamesService.getGamesReleasingSoon(controller.signal);

    request
      .then((games) => {
        if (!controller.signal.aborted) {
          setState({ games, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn("Fetching games failed", error);
        setState({
          games: [],
          loading: false,
          error: "Error fetching games. Please try again later.",
        });
      });

    return () => controller.abort();
  }, [gamesService, searchPhrase]);

  return state;
};

export default useGames;
