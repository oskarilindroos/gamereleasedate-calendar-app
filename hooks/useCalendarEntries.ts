import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useGamesService } from "../context/GamesServiceContext";
import {
  CalendarEntry,
  listCalendarEntries,
  removeCalendarEntry,
} from "../services/calendar/calendarService";
import { notify } from "../services/notify";
import { Game } from "../types/games";

export interface CalendarListItem extends CalendarEntry {
  // IGDB details for the cover image, when available
  game: Game | null;
}

interface CalendarEntriesState {
  items: CalendarListItem[];
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

const INITIAL: CalendarEntriesState = {
  items: [],
  loading: true,
  error: null,
  permissionDenied: false,
};

// Games in the app's calendar. Reloaded whenever the screen comes into focus so
// games added (or removed in the Calendar app) in the meantime show up.
const useCalendarEntries = () => {
  const gamesService = useGamesService();
  const [state, setState] = useState<CalendarEntriesState>(INITIAL);

  const load = useCallback(
    async (signal: AbortSignal) => {
      try {
        const result = await listCalendarEntries();
        if (signal.aborted) return;
        if (result.status === "permission-denied") {
          setState({ ...INITIAL, loading: false, permissionDenied: true });
          return;
        }

        // Covers are a nice-to-have: show the entries even if IGDB can't be reached
        const ids = [
          ...new Set(result.entries.flatMap(({ gameId }) => (gameId ? [gameId] : []))),
        ];
        const games = await gamesService.getGamesByIds(ids, signal).catch((error) => {
          console.warn("Loading calendar game covers failed", error);
          return [];
        });
        if (signal.aborted) return;

        const gamesById = new Map(games.map((game) => [game.id, game]));
        setState({
          ...INITIAL,
          loading: false,
          items: result.entries.map((entry) => ({
            ...entry,
            game: (entry.gameId && gamesById.get(entry.gameId)) || null,
          })),
        });
      } catch (error) {
        if (signal.aborted) return;
        console.warn("Loading calendar entries failed", error);
        setState({ ...INITIAL, loading: false, error: "Error loading your calendar." });
      }
    },
    [gamesService]
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      load(controller.signal);
      return () => controller.abort();
    }, [load])
  );

  const remove = useCallback(async (item: CalendarListItem) => {
    try {
      await removeCalendarEntry(item.eventId);
      setState((current) => ({
        ...current,
        items: current.items.filter(({ eventId }) => eventId !== item.eventId),
      }));
      notify("Removed from calendar");
    } catch (error) {
      console.warn("Removing calendar event failed", error);
      notify("Error removing event");
    }
  }, []);

  return { ...state, remove };
};

export default useCalendarEntries;
