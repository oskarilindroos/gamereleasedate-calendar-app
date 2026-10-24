import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { Game } from "../../types/games";

export const CALENDAR_TITLE = "Game Release Date Calendar";
const CALENDAR_COLOR = "#2196F3";
const EVENT_DURATION_MS = 60 * 60 * 1000;

export type AddEventResult = "added" | "already-exists" | "permission-denied";

// A game release event in the app's calendar
export interface CalendarEntry {
  eventId: string;
  title: string;
  releaseDate: Date;
  // IGDB id of the game, if the event was created by this app version
  gameId: number | null;
}

export type CalendarEntriesResult =
  | { status: "ok"; entries: CalendarEntry[] }
  | { status: "permission-denied" };

interface ReleaseEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  notes: string;
}

// The IGDB id is stored in the event notes (supported on both platforms) so the
// calendar list can show the game's cover
const GAME_ID_PATTERN = /IGDB game id: (\d+)/;

export const parseGameId = (notes?: string | null): number | null => {
  const match = notes ? GAME_ID_PATTERN.exec(notes) : null;
  return match ? Number(match[1]) : null;
};

// Games usually unlock at midnight, so the event starts at 00:00 local time on the release day
export const buildReleaseEvent = (game: Game): ReleaseEvent => ({
  title: game.name,
  startDate: game.releaseDate,
  endDate: new Date(game.releaseDate.getTime() + EVENT_DURATION_MS),
  notes: `Added by Game Release Calendar\nIGDB game id: ${game.id}`,
});

const findAppCalendar = async () => {
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  return calendars.find(
    (calendar) => calendar.title === CALENDAR_TITLE && calendar.allowsModifications
  );
};

// Picks an iOS calendar source that can hold a new calendar: the default calendar's
// source (usually iCloud), falling back to the on-device "local" source.
const iosCalendarSource = (): Calendar.Source => {
  try {
    const defaultSource = Calendar.getDefaultCalendarSync().source;
    if (defaultSource) return defaultSource;
  } catch {
    // No default calendar configured on the device
  }
  const local = Calendar.getSourcesSync().find(
    (source) => source.type === Calendar.SourceType.LOCAL
  );
  if (!local) throw new Error("No calendar source available");
  return local;
};

const createAppCalendar = () =>
  Calendar.createCalendar(
    Platform.OS === "ios"
      ? {
          title: CALENDAR_TITLE,
          color: CALENDAR_COLOR,
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: iosCalendarSource().id,
        }
      : {
          title: CALENDAR_TITLE,
          color: CALENDAR_COLOR,
          name: "gameReleaseDateCalendar",
          ownerAccount: "personal",
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
          source: {
            isLocalAccount: true,
            name: CALENDAR_TITLE,
            type: Calendar.SourceType.LOCAL,
          },
        }
  );

// Adds the game's release to the app's own calendar, creating the calendar if needed.
// Throws if the calendar API fails.
export const addGameToCalendar = async (game: Game): Promise<AddEventResult> => {
  const { status } = await Calendar.requestCalendarPermissions();
  if (status !== "granted") {
    return "permission-denied";
  }

  const calendar = (await findAppCalendar()) ?? (await createAppCalendar());
  const event = buildReleaseEvent(game);

  const existingEvents = await calendar.listEvents(event.startDate, event.endDate);
  if (existingEvents.some(({ title }) => title === game.name)) {
    return "already-exists";
  }

  await calendar.createEvent(event);
  return "added";
};

// iOS only returns events within a four year span per query
const MAX_QUERY_SPAN_MS = 4 * 365 * 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
// Recently released games stay in the list for a year; release dates are rarely
// announced further than a decade ahead
const LIST_PAST_MS = YEAR_MS;
const LIST_FUTURE_MS = 10 * YEAR_MS;

const listEventsInRange = async (
  calendar: Calendar.ExpoCalendar,
  from: Date,
  to: Date
) => {
  const events = [];
  for (let start = from.getTime(); start < to.getTime(); start += MAX_QUERY_SPAN_MS) {
    const end = Math.min(start + MAX_QUERY_SPAN_MS, to.getTime());
    events.push(...(await calendar.listEvents(new Date(start), new Date(end))));
  }
  // An event crossing a window boundary is returned twice
  return [...new Map(events.map((event) => [event.id, event])).values()];
};

// Lists the release events in the app's calendar, soonest first.
// Doesn't ask for permission: without it nothing can have been added yet.
export const listCalendarEntries = async (
  now: Date = new Date()
): Promise<CalendarEntriesResult> => {
  const { status } = await Calendar.getCalendarPermissions();
  if (status === "denied") return { status: "permission-denied" };
  if (status !== "granted") return { status: "ok", entries: [] };

  const calendar = await findAppCalendar();
  if (!calendar) return { status: "ok", entries: [] };

  const events = await listEventsInRange(
    calendar,
    new Date(now.getTime() - LIST_PAST_MS),
    new Date(now.getTime() + LIST_FUTURE_MS)
  );

  const entries = events
    .map((event) => ({
      eventId: event.id,
      title: event.title,
      releaseDate: new Date(event.startDate),
      gameId: parseGameId(event.notes),
    }))
    .sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

  return { status: "ok", entries };
};

export const removeCalendarEntry = async (eventId: string): Promise<void> => {
  const event = await Calendar.ExpoCalendarEvent.get(eventId);
  await event.delete();
};
