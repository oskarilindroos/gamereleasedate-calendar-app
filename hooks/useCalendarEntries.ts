import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { useGamesService } from "../context/GamesServiceContext";
import {
  CalendarEntry,
  listCalendarEntries,
  removeCalendarEntry,
} from "../services/calendar/calendarService";
import { queryKeys } from "../services/query/queryClient";
import { Game } from "../types/games";
import { useRefreshOnFocus } from "./useRefreshOnFocus";

export interface CalendarListItem extends CalendarEntry {
  // IGDB details for the cover image, when available
  game: Game | null;
}

type CalendarListResult =
  | { permissionDenied: false; items: CalendarListItem[] }
  | { permissionDenied: true; items: [] };

// Games in the app's calendar. Refetched whenever the screen comes into focus so
// games added (or removed in the Calendar app) in the meantime show up.
const useCalendarEntries = () => {
  const gamesService = useGamesService();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.calendarEntries,
    // The device calendar can change outside the app at any time
    staleTime: 0,
    queryFn: async ({ signal }): Promise<CalendarListResult> => {
      const result = await listCalendarEntries();
      if (result.status === "permission-denied") {
        return { permissionDenied: true, items: [] };
      }

      // Covers are a nice-to-have: show the entries even if IGDB can't be reached
      const ids = [
        ...new Set(result.entries.flatMap(({ gameId }) => (gameId ? [gameId] : []))),
      ];
      const games = await gamesService.getGamesByIds(ids, signal).catch((error) => {
        console.warn("Loading calendar game covers failed", error);
        return [];
      });

      const gamesById = new Map(games.map((game) => [game.id, game]));
      return {
        permissionDenied: false,
        items: result.entries.map((entry) => ({
          ...entry,
          game: (entry.gameId && gamesById.get(entry.gameId)) || null,
        })),
      };
    },
  });

  useRefreshOnFocus(query.refetch);

  const removal = useMutation({
    mutationFn: (item: CalendarListItem) => removeCalendarEntry(item.eventId),
    onSuccess: (_, removed) => {
      queryClient.setQueryData<CalendarListResult>(queryKeys.calendarEntries, (current) =>
        current && !current.permissionDenied
          ? {
              ...current,
              items: current.items.filter(({ eventId }) => eventId !== removed.eventId),
            }
          : current
      );
      toast.success("Removed from calendar");
    },
    onError: (error) => {
      console.warn("Removing calendar event failed", error);
      toast.error("Error removing event");
    },
  });

  return {
    items: query.data?.items ?? [],
    loading: query.isPending,
    error: query.isError ? "Error loading your calendar." : null,
    permissionDenied: query.data?.permissionDenied ?? false,
    remove: removal.mutate,
  };
};

export default useCalendarEntries;
