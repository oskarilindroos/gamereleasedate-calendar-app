// Fictional games used by the mock IGDB API. Release dates are relative to "now"
// so the data never goes stale.

export interface MockGameFixture {
  id: number;
  name: string;
  releaseInDays: number;
  summary?: string;
  coverImageId?: string;
  screenshotImageIds?: string[];
  platforms?: (string | null)[];
  // IGDB game_types id, 0 = main game (default)
  gameType?: number;
  // Filtered out by the app's queries (alternative edition / adult content)
  versionParent?: number;
  themeSlugs?: string[];
}

export const mockGames: MockGameFixture[] = [
  {
    id: 1001,
    name: "Stellar Frontier",
    releaseInDays: 3,
    summary:
      "Chart unknown star systems, build outposts and negotiate with alien factions in a vast open galaxy.",
    coverImageId: "mockcover1001",
    screenshotImageIds: ["mockshot1001a", "mockshot1001b", "mockshot1001c"],
    platforms: ["PC", "PS5", "XSX"],
  },
  {
    id: 1002,
    name: "Neon Drift 2",
    releaseInDays: 6,
    summary: "Arcade street racing through a rain-soaked synthwave city.",
    coverImageId: "mockcover1002",
    screenshotImageIds: ["mockshot1002a", "mockshot1002b"],
    platforms: ["PC", "Switch 2"],
  },
  {
    id: 1003,
    name: "Hollow Crown",
    releaseInDays: 9,
    summary: "A hand-drawn metroidvania about a fallen kingdom beneath the sea.",
    coverImageId: "mockcover1003",
    screenshotImageIds: ["mockshot1003a"],
    platforms: ["PC", "PS5", "XSX", "Switch 2"],
  },
  {
    id: 1004,
    name: "Iron Harvest Tactics",
    releaseInDays: 12,
    // No summary or screenshots: exercises the optional parts of the UI
    coverImageId: "mockcover1004",
    platforms: ["PC"],
  },
  {
    id: 1005,
    name: "Moonlit Bakery",
    releaseInDays: 15,
    summary: "Run a cosy bakery that only opens after midnight.",
    // No cover: the app falls back to IGDB's "nocover" image
    screenshotImageIds: ["mockshot1005a", "mockshot1005b"],
    platforms: ["PC", null],
  },
  {
    id: 1006,
    name: "Shadow Protocol",
    releaseInDays: 20,
    summary: "Stealth espionage across six cities.",
    coverImageId: "mockcover1006",
    screenshotImageIds: ["mockshot1006a", "mockshot1006b"],
    platforms: ["PS5", "XSX"],
  },
  {
    id: 1007,
    name: "Shadow Protocol: Deluxe Edition",
    releaseInDays: 20,
    coverImageId: "mockcover1007",
    platforms: ["PS5"],
    versionParent: 1006,
  },
  {
    id: 1008,
    name: "Velvet Nights",
    releaseInDays: 10,
    coverImageId: "mockcover1008",
    platforms: ["PC"],
    themeSlugs: ["erotic"],
  },
  {
    id: 1012,
    name: "Hollow Crown: Abyssal Tides",
    releaseInDays: 18,
    summary: "DLC adding a new underwater region.",
    coverImageId: "mockcover1012",
    platforms: ["PC", "PS5"],
    gameType: 1, // dlc_addon
  },
  {
    id: 1013,
    name: "Stellar Frontier: Rift Expansion",
    releaseInDays: 25,
    coverImageId: "mockcover1013",
    platforms: ["PC"],
    gameType: 2, // expansion
  },
  {
    id: 1014,
    name: "Neon Drift 2: Season Pass Pack",
    releaseInDays: 6,
    coverImageId: "mockcover1014",
    platforms: ["PC"],
    gameType: 13, // pack
  },
  {
    id: 1015,
    name: "Moonlit Bakery: Night Shift",
    releaseInDays: 28,
    summary: "A standalone expansion: playable without the original game.",
    coverImageId: "mockcover1015",
    platforms: ["PC", "Switch 2"],
    gameType: 4, // standalone_expansion, kept
  },
  {
    id: 1009,
    name: "Stellar Frontier: Echoes",
    releaseInDays: 75,
    summary: "The standalone sequel to Stellar Frontier.",
    coverImageId: "mockcover1009",
    screenshotImageIds: ["mockshot1009a"],
    platforms: ["PC", "PS5"],
  },
  {
    id: 1010,
    name: "Kingdom of Ash",
    releaseInDays: 140,
    summary: "A grim strategy RPG about rebuilding a burned empire.",
    coverImageId: "mockcover1010",
    platforms: ["PC"],
  },
  {
    id: 1011,
    name: "Retro Kart Remastered",
    releaseInDays: -30,
    summary: "Already released, should never appear in the app.",
    coverImageId: "mockcover1011",
    platforms: ["Switch 2"],
  },
];
