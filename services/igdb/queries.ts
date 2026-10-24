// Builders for IGDB "Apicalypse" query bodies. See https://api-docs.igdb.com/#apicalypse

const GAME_FIELDS =
  "fields name, id, cover.image_id, first_release_date, summary, screenshots.image_id, platforms.abbreviation;";

// Exclude adult content and alternative versions (e.g. editions) of the same game
const BASE_FILTER = `themes.slug != "erotic" & version_parent = null`;

// Escape user input so it can't break out of a quoted Apicalypse string
export const escapeQueryString = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export const searchUpcomingGamesQuery = (
  searchPhrase: string,
  nowUnix: number,
  limit = 200
): string =>
  [
    GAME_FIELDS,
    `where name ~ *"${escapeQueryString(searchPhrase.trim())}"* & ${BASE_FILTER} & first_release_date > ${nowUnix};`,
    "sort first_release_date asc;",
    `limit ${limit};`,
  ].join("\n");

export const gamesReleasingBetweenQuery = (
  fromUnix: number,
  toUnix: number,
  limit = 400
): string =>
  [
    GAME_FIELDS,
    `where ${BASE_FILTER} & first_release_date > ${fromUnix} & first_release_date < ${toUnix};`,
    "sort first_release_date asc;",
    `limit ${limit};`,
  ].join("\n");
