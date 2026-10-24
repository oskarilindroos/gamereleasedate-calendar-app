import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { Game } from "../../types/games";

export const CALENDAR_TITLE = "Game Release Date Calendar";
const CALENDAR_COLOR = "#2196F3";

export type AddEventResult = "added" | "already-exists" | "permission-denied";

interface AllDayEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: true;
  timeZone?: string;
}

// Builds an all-day event on the game's release day.
// Android's calendar provider requires all-day events to be stored in UTC with
// midnight boundaries, while iOS (EventKit) expects local dates.
export const buildReleaseDayEvent = (
  game: Game,
  os: typeof Platform.OS = Platform.OS
): AllDayEvent => {
  const day = game.releaseDate;
  if (os === "android") {
    const y = day.getFullYear();
    const m = day.getMonth();
    const d = day.getDate();
    return {
      title: game.name,
      startDate: new Date(Date.UTC(y, m, d)),
      endDate: new Date(Date.UTC(y, m, d + 1)),
      allDay: true,
      timeZone: "UTC",
    };
  }
  return {
    title: game.name,
    startDate: day,
    endDate: new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1),
    allDay: true,
  };
};

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

// Adds the game's release day to the app's own calendar, creating the calendar if needed.
// Throws if the calendar API fails.
export const addGameToCalendar = async (game: Game): Promise<AddEventResult> => {
  const { status } = await Calendar.requestCalendarPermissions();
  if (status !== "granted") {
    return "permission-denied";
  }

  const calendar = (await findAppCalendar()) ?? (await createAppCalendar());
  const event = buildReleaseDayEvent(game);

  const existingEvents = await calendar.listEvents(event.startDate, event.endDate);
  if (existingEvents.some(({ title }) => title === game.name)) {
    return "already-exists";
  }

  await calendar.createEvent(event);
  return "added";
};
