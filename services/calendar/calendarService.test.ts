import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { Game } from "../../types/games";
import { addGameToCalendar, buildReleaseDayEvent, CALENDAR_TITLE } from "./calendarService";

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

beforeEach(() => {
  jest.clearAllMocks();
  setPlatform("ios");
  mocked.requestCalendarPermissions.mockResolvedValue({
    status: "granted",
  } as Calendar.PermissionResponse);
});

describe("buildReleaseDayEvent", () => {
  it("creates a local all-day event on iOS", () => {
    expect(buildReleaseDayEvent(game, "ios")).toEqual({
      title: "Stellar Frontier",
      startDate: new Date(2026, 10, 7),
      endDate: new Date(2026, 10, 8),
      allDay: true,
    });
  });

  it("creates a UTC all-day event on Android", () => {
    expect(buildReleaseDayEvent(game, "android")).toEqual({
      title: "Stellar Frontier",
      startDate: new Date("2026-11-07T00:00:00Z"),
      endDate: new Date("2026-11-08T00:00:00Z"),
      allDay: true,
      timeZone: "UTC",
    });
  });
});

describe("addGameToCalendar", () => {
  it("does nothing without calendar permission", async () => {
    mocked.requestCalendarPermissions.mockResolvedValue({
      status: "denied",
    } as Calendar.PermissionResponse);

    await expect(addGameToCalendar(game)).resolves.toBe("permission-denied");
    expect(mocked.getCalendars).not.toHaveBeenCalled();
  });

  it("adds the event to the existing app calendar", async () => {
    const calendar = fakeCalendar();
    mocked.getCalendars.mockResolvedValue([
      fakeCalendar({ title: "Work" }),
      calendar,
    ]);

    await expect(addGameToCalendar(game)).resolves.toBe("added");
    expect(mocked.createCalendar).not.toHaveBeenCalled();
    expect(calendar.createEvent).toHaveBeenCalledWith(
      buildReleaseDayEvent(game, "ios")
    );
  });

  it("doesn't add duplicate events", async () => {
    const calendar = fakeCalendar({
      listEvents: jest.fn().mockResolvedValue([{ title: "Stellar Frontier" }]),
    });
    mocked.getCalendars.mockResolvedValue([calendar]);

    await expect(addGameToCalendar(game)).resolves.toBe("already-exists");
    expect(calendar.listEvents).toHaveBeenCalledWith(
      new Date(2026, 10, 7),
      new Date(2026, 10, 8)
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
    expect(created.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ timeZone: "UTC" })
    );
  });

  it("ignores read-only calendars with the same title", async () => {
    mocked.getCalendars.mockResolvedValue([
      fakeCalendar({ allowsModifications: false }),
    ]);
    mocked.getDefaultCalendarSync.mockReturnValue({
      source: { id: "icloud", name: "iCloud", type: "caldav" },
    } as Calendar.ExpoCalendar);
    mocked.createCalendar.mockResolvedValue(fakeCalendar());

    await addGameToCalendar(game);
    expect(mocked.createCalendar).toHaveBeenCalled();
  });
});
