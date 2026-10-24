import { useCallback } from "react";
import { addGameToCalendar } from "../services/calendar/calendarService";
import { notify } from "../services/notify";
import { Game } from "../types/games";

const MESSAGES = {
  added: "Event added to calendar",
  "already-exists": "Event already exists",
  "permission-denied": "Calendar permission is required to add events",
} as const;

const useCalendar = () => {
  const addEvent = useCallback(async (game: Game) => {
    try {
      const result = await addGameToCalendar(game);
      notify(MESSAGES[result]);
    } catch (error) {
      console.warn("Adding calendar event failed", error);
      notify("Error adding event");
    }
  }, []);

  return { addEvent };
};

export default useCalendar;
