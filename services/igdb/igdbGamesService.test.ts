import {
  createMockFetch,
  MOCK_CLIENT_ID,
  MOCK_CLIENT_SECRET,
} from "../../mock-igdb/igdbMock.ts";
import { createIgdbGamesService } from "./igdbGamesService";
import { createTwitchTokenProvider, TokenProvider } from "./twitchTokenProvider";

const NOW = new Date(Date.UTC(2026, 9, 24, 12));
const API_URL = "https://api.example.com/v4";
const IMAGE_URL = "https://images.example.com";
const PAGE = { offset: 0, limit: 50 };

// Real service + token provider, talking to the mock IGDB API
const createService = (fetchFn = createMockFetch(() => NOW)) =>
  createIgdbGamesService({
    apiURL: API_URL,
    imageURL: IMAGE_URL,
    clientId: MOCK_CLIENT_ID,
    tokenProvider: createTwitchTokenProvider({
      tokenURL: "https://id.example.com/oauth2/token",
      clientId: MOCK_CLIENT_ID,
      clientSecret: MOCK_CLIENT_SECRET,
      fetchFn,
    }),
    fetchFn,
    now: () => NOW,
  });

describe("igdbGamesService (against the mock IGDB API)", () => {
  it("returns games releasing in the next 30 days, soonest first", async () => {
    const { games } = await createService().getGamesReleasingSoon(PAGE);

    expect(games.map((game) => game.name)).toEqual([
      "Stellar Frontier",
      "Neon Drift 2",
      "Hollow Crown",
      "Iron Harvest Tactics",
      "Moonlit Bakery",
      "Shadow Protocol",
      "Moonlit Bakery: Night Shift",
    ]);
  });

  it("excludes DLC, expansions and DLC packs but keeps standalone expansions", async () => {
    const names = (await createService().getGamesReleasingSoon(PAGE)).games.map(
      (game) => game.name
    );

    expect(names).not.toContain("Hollow Crown: Abyssal Tides");
    expect(names).not.toContain("Stellar Frontier: Rift Expansion");
    expect(names).not.toContain("Neon Drift 2: Season Pass Pack");
    expect(names).toContain("Moonlit Bakery: Night Shift");
  });

  it("excludes editions and adult games", async () => {
    const names = (await createService().getGamesReleasingSoon(PAGE)).games.map(
      (game) => game.name
    );

    expect(names).not.toContain("Shadow Protocol: Deluxe Edition");
    expect(names).not.toContain("Velvet Nights");
  });

  it("searches all upcoming games by name, case-insensitively", async () => {
    const { games } = await createService().searchUpcomingGames("STELLAR", PAGE);

    expect(games.map((game) => game.name)).toEqual([
      "Stellar Frontier",
      "Stellar Frontier: Echoes",
    ]);
  });

  it("pages through the results", async () => {
    const service = createService();
    const all = await service.getGamesReleasingSoon(PAGE);

    const first = await service.getGamesReleasingSoon({ offset: 0, limit: 3 });
    const second = await service.getGamesReleasingSoon({ offset: 3, limit: 3 });
    const last = await service.getGamesReleasingSoon({ offset: 6, limit: 3 });

    expect([...first.games, ...second.games, ...last.games]).toEqual(all.games);
    expect([first.hasMore, second.hasMore, last.hasMore]).toEqual([true, true, false]);
  });

  it("looks up games by id, including DLC and released games", async () => {
    const games = await createService().getGamesByIds([1012, 1011, 1001]);

    expect(games.map((game) => game.id).sort()).toEqual([1001, 1011, 1012]);
  });

  it("doesn't call the API for an empty id list", async () => {
    const fetchFn = jest.fn(createMockFetch(() => NOW));
    await expect(createService(fetchFn).getGamesByIds([])).resolves.toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("doesn't return games that were already released", async () => {
    expect(await createService().searchUpcomingGames("Retro Kart", PAGE)).toEqual({
      games: [],
      hasMore: false,
    });
  });

  it("maps the response to app games", async () => {
    const {
      games: [game],
    } = await createService().searchUpcomingGames("Stellar Frontier", PAGE);

    expect(game).toEqual({
      id: 1001,
      name: "Stellar Frontier",
      summary: expect.stringContaining("Chart unknown star systems"),
      coverURL: `${IMAGE_URL}/t_cover_big/mockcover1001.png`,
      screenshotURLs: [
        `${IMAGE_URL}/t_screenshot_med_2x/mockshot1001a.jpg`,
        `${IMAGE_URL}/t_screenshot_med_2x/mockshot1001b.jpg`,
        `${IMAGE_URL}/t_screenshot_med_2x/mockshot1001c.jpg`,
      ],
      platforms: ["PC", "PS5", "XSX"],
      releaseDate: new Date(2026, 9, 27),
    });
  });

  it("sends the IGDB auth headers", async () => {
    const fetchFn = jest.fn(createMockFetch(() => NOW));
    await createService(fetchFn).getGamesReleasingSoon(PAGE);

    expect(fetchFn).toHaveBeenLastCalledWith(
      `${API_URL}/games`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Client-ID": MOCK_CLIENT_ID,
          Authorization: "Bearer mock-access-token",
        }),
      })
    );
  });
});

describe("igdbGamesService error handling", () => {
  const response = (status: number, body: unknown = []) =>
    ({ ok: status < 300, status, json: async () => body }) as Response;

  const tokenProvider = (): jest.Mocked<TokenProvider> => ({
    getToken: jest.fn().mockResolvedValue("token"),
    invalidate: jest.fn(),
  });

  const createWith = (fetchFn: jest.Mock, provider = tokenProvider()) =>
    createIgdbGamesService({
      apiURL: API_URL,
      imageURL: IMAGE_URL,
      clientId: "id",
      tokenProvider: provider,
      fetchFn,
      now: () => NOW,
    });

  it("refreshes the token and retries once on 401", async () => {
    const provider = tokenProvider();
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200, []));

    await expect(createWith(fetchFn, provider).getGamesReleasingSoon(PAGE)).resolves.toEqual({
      games: [],
      hasMore: false,
    });
    expect(provider.invalidate).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("throws an ApiError on other failures", async () => {
    const fetchFn = jest.fn().mockResolvedValue(response(429));

    await expect(createWith(fetchFn).searchUpcomingGames("x", PAGE)).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
    });
  });

  it("counts undated games when deciding whether there are more pages", async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(response(200, [{ id: 1, name: "No date" }]));

    await expect(
      createWith(fetchFn).getGamesReleasingSoon({ offset: 0, limit: 1 })
    ).resolves.toEqual({ games: [], hasMore: true });
  });

  it("skips games without a release date", async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(response(200, [{ id: 1, name: "No date" }]));

    await expect(createWith(fetchFn).searchUpcomingGames("x", PAGE)).resolves.toEqual({
      games: [],
      hasMore: false,
    });
  });

  it("passes the abort signal to fetch", async () => {
    const fetchFn = jest.fn().mockResolvedValue(response(200, []));
    const controller = new AbortController();

    await createWith(fetchFn).getGamesReleasingSoon(PAGE, controller.signal);
    expect(fetchFn.mock.calls[0][1].signal).toBe(controller.signal);
  });
});
