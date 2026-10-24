import { mapIgdbGame } from "./mapGame";

const IMAGE_URL = "https://images.example.com";

describe("mapIgdbGame", () => {
  it("maps an IGDB game to the app format", () => {
    const game = mapIgdbGame(
      {
        id: 1,
        name: "Game",
        summary: " A summary ",
        first_release_date: Date.UTC(2026, 10, 7) / 1000,
        cover: { id: 2, image_id: "cov" },
        screenshots: [
          { id: 3, image_id: "s1" },
          { id: 4, image_id: "s2" },
        ],
        platforms: [{ id: 5, abbreviation: "PC" }, { id: 6 }],
      },
      IMAGE_URL
    );

    expect(game).toEqual({
      id: 1,
      name: "Game",
      summary: "A summary",
      coverURL: `${IMAGE_URL}/t_cover_big/cov.png`,
      screenshotURLs: [
        `${IMAGE_URL}/t_screenshot_med_2x/s1.jpg`,
        `${IMAGE_URL}/t_screenshot_med_2x/s2.jpg`,
      ],
      platforms: ["PC", "Unknown"],
      releaseDate: new Date(2026, 10, 7),
    });
  });

  it("handles games with missing optional fields", () => {
    const game = mapIgdbGame(
      { id: 1, name: "Game", first_release_date: 0 },
      IMAGE_URL
    );

    expect(game.summary).toBeNull();
    expect(game.coverURL).toBe(`${IMAGE_URL}/t_cover_big/nocover.png`);
    expect(game.screenshotURLs).toEqual([]);
    expect(game.platforms).toEqual([]);
  });
});
