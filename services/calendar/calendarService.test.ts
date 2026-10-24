import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { Game } from "../../types/games";
import {
  addGameToCalendar,
  buildReleaseEvent,
  CALENDAR_TITLE,
  listCalendarEntries,
  parseGameId,
  removeCalendarEntry,
} from "./calendarService";

const mocked = jest.mocked(Calendar);

const game: Game = {
  id: 1,
  name: "Stellar Frontier",
  summary: null,
  coverURL: "",
  screenshotURLs: [],
  platforms: [],
  releaseDate: new Date(2026, 10, 7),
};

const fakeCalendar = (overrides: Partial<Calendar.ExpoCalendar> = {}) =>
  ({
    id: "cal-1",
    title: CALENDAR_TITLE,
    allowsModifications: true,
    listEvents: jest.fn().mockResolvedValue([]),
    createEvent: jest.fn().mockResolvedValue({ id: "event-1" }),
    ...overrides,
  }) as unknown as jest.Mocked<Calendar.ExpoCalendar>;

const setPlatform = (os: "ios" | "android") => {
  Object.defineProperty(Platform, "OS", { get: () => os, configurable: true });
};

const permission = (status: string) =>
  ({ status }) as Calendar.PermissionResponse;

beforeEach(() => {
  jest.clearAllMocks();
  setPlatform("ios");
  mocked.requestCalendarPermissions.mockResolvedValue(permission("granted"));
  mocked.getCalendarPermissions.mockResolvedValue(permission("granted"));
});

describe("buildReleaseEvent", () => {
  it("starts at local midnight on the release day and lasts an hour", () => {
    const event = buildReleaseEvent(game);

    expect(event).toEqual({
      title: "Stellar Frontier",
      startDate: new Date(2026, 10, 7, 0, 0),
      endDate: new Date(2026, 10, 7, 1, 0),
      notes: expect.stringContaining("IGDB game id: 1"),
    });
    expect(event).not.toHaveProperty("allDay");
  });

  it("stores the game id so it can be read back", () => {
    expect(parseGameId(buildReleaseEvent({ ...game, id: 4321 }).notes)).toBe(4321);
  });
});

describe("parseGameId", () => {
  it("returns null for events without a game id", () => {
    expect(parseGameId(undefined)).toBeNull();
    expect(parseGameId("Some other notes")).toBeNull();
  });
});

describe("addGameToCalendar", () => {
  it("does nothing without calendar permission", async () => {
    mocked.requestCalendarPermissions.mockResolvedValue(permission("denied"));

    await expect(addGameToCalendar(game)).resolves.toBe("permission-denied");
    expect(mocked.getCalendars).not.toHaveBeenCalled();
  });

  it("adds the event to the existing app calendar", async () => {
    const calendar = fakeCalendar();
    mocked.getCalendars.mockResolvedValue([fakeCalendar({ title: "Work" }), calendar]);

    await expect(addGameToCalendar(game)).resolves.toBe("added");
    expect(mocked.createCalendar).not.toHaveBeenCalled();
    expect(calendar.createEvent).toHaveBeenCalledWith(buildReleaseEvent(game));
  });

  it("doesn't add duplicate events", async () => {
    const calendar = fakeCalendar({
      listEvents: jest.fn().mockResolvedValue([{ title: "Stellar Frontier" }]),
    });
    mocked.getCalendars.mockResolvedValue([calendar]);

    await expect(addGameToCalendar(game)).resolves.toBe("already-exists");
    expect(calendar.listEvents).toHaveBeenCalledWith(
      new Date(2026, 10, 7, 0, 0),
      new Date(2026, 10, 7, 1, 0)
    );
    expect(calendar.createEvent).not.toHaveBeenCalled();
  });

  it("creates the app calendar in the default calendar's source on iOS", async () => {
    const created = fakeCalendar();
    mocked.getCalendars.mockResolvedValue([]);
    mocked.getDefaultCalendarSync.mockReturnValue({
      source: { id: "icloud", name: "iCloud", type: "caldav" },
    } as Calendar.ExpoCalendar);
    mocked.createCalendar.mockResolvedValue(created);

    await expect(addGameToCalendar(game)).resolves.toBe("added");
    expect(mocked.createCalendar).toHaveBeenCalledWith(
      expect.objectContaining({ title: CALENDAR_TITLE, sourceId: "icloud" })
    );
    expect(created.createEvent).toHaveBeenCalled();
  });

  it("falls back to the local source on iOS when there is no default calendar", async () => {
    mocked.getCalendars.mockResolvedValue([]);
    mocked.getDefaultCalendarSync.mockImplementation(() => {
      throw new Error("no default calendar");
    });
    mocked.getSourcesSync.mockReturnValue([
      { id: "local-1", name: "Default", type: "local" },
    ]);
    mocked.createCalendar.mockResolvedValue(fakeCalendar());

    await addGameToCalendar(game);
    expect(mocked.createCalendar).toHaveBeenCalledWith(
      expect.objectContaining({ sourceId: "local-1" })
    );
  });

  it("creates a local calendar on Android", async () => {
    setPlatform("android");
    const created = fakeCalendar();
    mocked.getCalendars.mockResolvedValue([]);
    mocked.createCalendar.mockResolvedValue(created);

    await addGameToCalendar(game);
    expect(mocked.createCalendar).toHaveBeenCalledWith(
      expect.objectContaining({
        title: CALENDAR_TITLE,
        source: expect.objectContaining({ isLocalAccount: true, type: "local" }),
      })
    );
    expect(created.createEvent).toHaveBeenCalledWith(buildReleaseEvent(game));
  });

  it("ignores read-only calendars with the same title", async () => {
    mocked.getCalendars.mockResolvedValue([fakeCalendar({ allowsModifications: false })]);
    mocked.getDefaultCalendarSync.mockReturnValue({
      source: { id: "icloud", name: "iCloud", type: "caldav" },
    } as Calendar.ExpoCalendar);
    mocked.createCalendar.mockResolvedValue(fakeCalendar());

    await addGameToCalendar(game);
    expect(mocked.createCalendar).toHaveBeenCalled();
  });
});

describe("listCalendarEntries", () => {
  const NOW = new Date(2026, 9, 24);
  const event = (id: string, title: string, start: Date, notes = "") => ({
    id,
    title,
    startDate: start.toISOString(),
    notes,
  });

  it("returns the app calendar's events soonest first, with their game ids", async () => {
    const calendar = fakeCalendar({
      listEvents: jest
        .fn()
        .mockResolvedValueOnce([
          event("b", "Later", new Date(2027, 0, 1), "IGDB game id: 2"),
          event("a", "Sooner", new Date(2026, 10, 1), "IGDB game id: 1"),
        ])
        .mockResolvedValue([]),
    });
    mocked.getCalendars.mockResolvedValue([calendar]);

    const result = await listCalendarEntries(NOW);

    expect(result).toEqual({
      status: "ok",
      entries: [
        { eventId: "a", title: "Sooner", releaseDate: new Date(2026, 10, 1), gameId: 1 },
        { eventId: "b", title: "Later", releaseDate: new Date(2027, 0, 1), gameId: 2 },
      ],
    });
  });

  it("queries in spans of at most four years and removes duplicates", async () => {
    const duplicate = event("a", "Game", new Date(2028, 0, 1));
    const listEvents = jest.fn().mockResolvedValue([duplicate]);
    mocked.getCalendars.mockResolvedValue([fakeCalendar({ listEvents })]);

    const result = await listCalendarEntries(NOW);

    const FOUR_YEARS = 4 * 365 * 24 * 60 * 60 * 1000;
    for (const [from, to] of listEvents.mock.calls) {
      expect(to.getTime() - from.getTime()).toBeLessThanOrEqual(FOUR_YEARS);
    }
    expect(listEvents.mock.calls.length).toBeGreaterThan(1);
    expect(result).toEqual({ status: "ok", entries: [expect.objectContaining({ eventId: "a" })] });
  });

  it("returns nothing when the app calendar doesn't exist yet", async () => {
    mocked.getCalendars.mockResolvedValue([]);
    await expect(listCalendarEntries(NOW)).resolves.toEqual({ status: "ok", entries: [] });
  });

  it("doesn't ask for permission when it hasn't been granted yet", async () => {
    mocked.getCalendarPermissions.mockResolvedValue(permission("undetermined"));

    await expect(listCalendarEntries(NOW)).resolves.toEqual({ status: "ok", entries: [] });
    expect(mocked.requestCalendarPermissions).not.toHaveBeenCalled();
  });

  it("reports when calendar access was denied", async () => {
    mocked.getCalendarPermissions.mockResolvedValue(permission("denied"));
    await expect(listCalendarEntries(NOW)).resolves.toEqual({ status: "permission-denied" });
  });
});

describe("removeCalendarEntry", () => {
  it("deletes the event", async () => {
    const remove = jest.fn().mockResolvedValue(undefined);
    jest.mocked(Calendar.ExpoCalendarEvent.get).mockResolvedValue({
      delete: remove,
    } as unknown as Calendar.ExpoCalendarEvent);

    await removeCalendarEntry("event-1");

    expect(Calendar.ExpoCalendarEvent.get).toHaveBeenCalledWith("event-1");
    expect(remove).toHaveBeenCalled();
  });
});
