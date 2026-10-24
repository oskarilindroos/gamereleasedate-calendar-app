import { renderHook } from "@testing-library/react-native";
import useCalendar from "./useCalendar";
import { addGameToCalendar } from "../services/calendar/calendarService";
import { notify } from "../services/notify";
import { makeGame } from "../test/fixtures";

jest.mock("../services/calendar/calendarService");
jest.mock("../services/notify");

const mockedAdd = jest.mocked(addGameToCalendar);
const mockedNotify = jest.mocked(notify);

beforeEach(() => jest.clearAllMocks());

describe("useCalendar", () => {
  it.each([
    ["added", "Event added to calendar"],
    ["already-exists", "Event already exists"],
    ["permission-denied", "Calendar permission is required to add events"],
  ] as const)("notifies the user when the result is '%s'", async (result, message) => {
    mockedAdd.mockResolvedValue(result);
    const { result: hook } = await renderHook(() => useCalendar());

    await hook.current.addEvent(makeGame());

    expect(mockedNotify).toHaveBeenCalledWith(message);
  });

  it("notifies the user when adding fails", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockedAdd.mockRejectedValue(new Error("boom"));
    const { result } = await renderHook(() => useCalendar());

    await result.current.addEvent(makeGame());

    expect(mockedNotify).toHaveBeenCalledWith("Error adding event");
  });
});
