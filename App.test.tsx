// End-to-end style test of the whole app: real screens, navigation, IGDB client
// and token provider, with the network replaced by the mock IGDB API.
import * as Calendar from "expo-calendar";
import { Alert } from "react-native";
import { act, fireEvent, screen, render, userEvent, waitFor } from "@testing-library/react-native";
import App from "./App";
import { navigationRef } from "./services/NavigationService";
import { createIgdbGamesService } from "./services/igdb/igdbGamesService";
import { createTwitchTokenProvider } from "./services/igdb/twitchTokenProvider";
import {
  createMockFetch,
  MOCK_CLIENT_ID,
  MOCK_CLIENT_SECRET,
} from "./mock-igdb/igdbMock.ts";

const NOW = new Date(2026, 9, 24, 12);

const createMockedGamesService = () => {
  const fetchFn = createMockFetch(() => NOW);
  return createIgdbGamesService({
    apiURL: "https://api.igdb.example/v4",
    imageURL: "https://images.igdb.example",
    clientId: MOCK_CLIENT_ID,
    tokenProvider: createTwitchTokenProvider({
      tokenURL: "https://id.twitch.example/oauth2/token",
      clientId: MOCK_CLIENT_ID,
      clientSecret: MOCK_CLIENT_SECRET,
      fetchFn,
    }),
    fetchFn,
    now: () => NOW,
  });
};

const renderApp = async () => {
  await render(<App gamesService={createMockedGamesService()} />);
  await screen.findByText("Stellar Frontier");
};

beforeEach(() => {
  jest.useFakeTimers({ now: NOW, advanceTimers: true });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("App", () => {
  it("shows the games releasing soon", async () => {
    await renderApp();

    expect(screen.getByText("Games releasing soon")).toBeOnTheScreen();
    expect(screen.getByText("Shadow Protocol")).toBeOnTheScreen();
    // Releasing later than 30 days from now
    expect(screen.queryByText("Kingdom of Ash")).not.toBeOnTheScreen();
  });

  it("searches games from the header", async () => {
    await renderApp();
    const input = screen.getByPlaceholderText("Search games...");

    await userEvent.type(input, "stellar");
    await fireEvent(input, "submitEditing");

    expect(await screen.findByText("Search results for 'stellar'")).toBeOnTheScreen();
    expect(await screen.findByText("Stellar Frontier: Echoes")).toBeOnTheScreen();
    expect(screen.queryByText("Neon Drift 2")).not.toBeOnTheScreen();
  });

  it("returns to the default list after an empty search", async () => {
    await renderApp();
    const input = screen.getByPlaceholderText("Search games...");

    await userEvent.type(input, "stellar");
    await fireEvent(input, "submitEditing");
    await screen.findByText("Search results for 'stellar'");

    await userEvent.clear(input);
    await fireEvent(input, "submitEditing");

    expect(await screen.findByText("Games releasing soon")).toBeOnTheScreen();
  });

  it("shows 'No results' when nothing matches", async () => {
    await renderApp();
    const input = screen.getByPlaceholderText("Search games...");

    await userEvent.type(input, "does not exist");
    await fireEvent(input, "submitEditing");

    expect(await screen.findByText("No results")).toBeOnTheScreen();
  });

  it("shows game details and adds the release to the calendar", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const createEvent = jest.fn().mockResolvedValue({ id: "event" });
    jest.mocked(Calendar.requestCalendarPermissions).mockResolvedValue({
      status: "granted",
    } as Calendar.PermissionResponse);
    jest.mocked(Calendar.getCalendars).mockResolvedValue([
      {
        title: "Game Release Date Calendar",
        allowsModifications: true,
        listEvents: jest.fn().mockResolvedValue([]),
        createEvent,
      } as unknown as Calendar.ExpoCalendar,
    ]);
    await renderApp();

    await userEvent.press(
      screen.getByRole("button", { name: "Stellar Frontier details" })
    );

    const modal = await screen.findByTestId("game-modal");
    expect(modal).toHaveTextContent(/Oct 27, 2026 \(in 3 days\)/);
    expect(modal).toHaveTextContent(/PC, PS5, XSX/);
    expect(screen.getByTestId("screenshot-carousel")).toBeOnTheScreen();

    await userEvent.press(screen.getByRole("button", { name: "Add to calendar" }));

    await waitFor(() =>
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Stellar Frontier", allDay: true })
      )
    );
    expect(alert).toHaveBeenCalledWith("Event added to calendar");
  });

  it("switches between dark and light theme in settings", async () => {
    await renderApp();

    await act(async () => navigationRef.navigate("Settings"));

    const toggle = await screen.findByRole("switch", { name: "Dark Mode" });
    const initial = toggle.props.value;
    await fireEvent(toggle, "valueChange", !initial);

    expect(screen.getByRole("switch", { name: "Dark Mode" })).toHaveProp(
      "value",
      !initial
    );
  });
});
