import { Game, IgdbGame } from "../../types/games";
import { releaseDayFromUnix } from "../../utils/dates";

// Image sizes: https://api-docs.igdb.com/#images
export const coverURL = (imageBaseURL: string, imageId?: string) =>
  `${imageBaseURL}/t_cover_big/${imageId ?? "nocover"}.png`;

const screenshotURL = (imageBaseURL: string, imageId: string) =>
  `${imageBaseURL}/t_screenshot_med_2x/${imageId}.jpg`;

// Converts an IGDB API game into the format used by the app
export const mapIgdbGame = (game: IgdbGame, imageBaseURL: string): Game => ({
  id: game.id,
  name: game.name,
  summary: game.summary?.trim() || null,
  coverURL: coverURL(imageBaseURL, game.cover?.image_id),
  screenshotURLs: (game.screenshots ?? []).map(({ image_id }) =>
    screenshotURL(imageBaseURL, image_id)
  ),
  platforms: (game.platforms ?? []).map(
    ({ abbreviation }) => abbreviation || "Unknown"
  ),
  releaseDate: releaseDayFromUnix(game.first_release_date),
});
