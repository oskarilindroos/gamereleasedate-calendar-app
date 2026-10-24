// Raw game object as returned by the IGDB /games endpoint for the fields we request
export interface IgdbGame {
  id: number;
  name: string;
  summary?: string;
  first_release_date: number; // Unix timestamp (seconds)
  cover?: {
    id: number;
    image_id: string;
  };
  screenshots?: {
    id: number;
    image_id: string;
  }[];
  platforms?: {
    id: number;
    abbreviation?: string;
  }[];
}

// Game in the format used throughout the app
export interface Game {
  id: number;
  name: string;
  summary: string | null;
  coverURL: string;
  screenshotURLs: string[];
  platforms: string[];
  // Local midnight of the release day (IGDB release dates are UTC calendar days)
  releaseDate: Date;
}
