import { renderHook, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";
import useCalendar from "./useCalendar";
import { addGameToCalendar } from "../services/calendar/calendarService";
import { queryKeys } from "../services/query/queryClient";
import { makeGame } from "../test/fixtures";
import { createQueryWrapper, createTestQueryClient } from "../test/queryClient";

jest.mock("../services/calendar/calendarService");

const mockedAdd = jest.mocked(addGameToCalendar);
const mockedToast = jest.mocked(toast);

const renderUseCalendar = (client = createTestQueryClient()) =>
  renderHook(() => useCalendar(), { wrapper: createQueryWrapper(client) });

beforeEach(() => jest.clearAllMocks());

describe("useCalendar", () => {
  it("shows a success toast and refreshes the calendar list when the game was added", async () => {
    mockedAdd.mockResolvedValue("added");
    const client = createTestQueryClient();
    const invalidate = jest.spyOn(client, "invalidateQueries");
    const { result } = await renderUseCalendar(client);

    result.current.addEvent(makeGame());

    await waitFor(() =>
      expect(mockedToast.success).toHaveBeenCalledWith("Event added to calendar")
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.calendarEntries });
  });

  it("tells the user when the event already exists", async () => {
    mockedAdd.mockResolvedValue("already-exists");
    const { result } = await renderUseCalendar();

    result.current.addEvent(makeGame());

    await waitFor(() => expect(mockedToast).toHaveBeenCalledWith("Event already exists"));
  });

  it("shows an error toast without calendar permission", async () => {
    mockedAdd.mockResolvedValue("permission-denied");
    const { result } = await renderUseCalendar();

    result.current.addEvent(makeGame());

    await waitFor(() =>
      expect(mockedToast.error).toHaveBeenCalledWith(
        "Calendar permission is required to add events"
      )
    );
  });

  it("shows an error toast when adding fails", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockedAdd.mockRejectedValue(new Error("boom"));
    const { result } = await renderUseCalendar();

    result.current.addEvent(makeGame());

    await waitFor(() => expect(mockedToast.error).toHaveBeenCalledWith("Error adding event"));
  });
});
