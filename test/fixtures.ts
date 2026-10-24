import { Game } from "../types/games";

export const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: 1,
  name: "Stellar Frontier",
  summary: "Chart unknown star systems.",
  coverURL: "https://images.example.com/t_cover_big/cover.png",
  screenshotURLs: [],
  platforms: ["PC", "PS5"],
  releaseDate: new Date(2026, 10, 7),
  ...overrides,
});
