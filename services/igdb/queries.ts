// Builders for IGDB "Apicalypse" query bodies. See https://api-docs.igdb.com/#apicalypse

const GAME_FIELDS =
  "fields name, id, cover.image_id, first_release_date, summary, screenshots.image_id, platforms.abbreviation;";

// Game types that are add-ons to another game rather than games of their own.
// IDs from the IGDB game_types endpoint: https://api-docs.igdb.com/#game-type
const EXCLUDED_GAME_TYPES = {
  dlcAddon: 1,
  expansion: 2,
  pack: 13,
} as const;

// Exclude adult content, alternative versions (e.g. editions) of the same game and DLC
const BASE_FILTER = [
  `themes.slug != "erotic"`,
  "version_parent = null",
  `game_type != (${Object.values(EXCLUDED_GAME_TYPES).join(",")})`,
].join(" & ");

// A slice of a sorted result list. IGDB returns at most 500 games per request.
export interface PageRequest {
  offset: number;
  limit: number;
}

const pageClause = ({ offset, limit }: PageRequest) => `limit ${limit};\noffset ${offset};`;

// Escape user input so it can't break out of a quoted Apicalypse string
export const escapeQueryString = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export const searchUpcomingGamesQuery = (
  searchPhrase: string,
  nowUnix: number,
  page: PageRequest
): string =>
  [
    GAME_FIELDS,
    `where name ~ *"${escapeQueryString(searchPhrase.trim())}"* & ${BASE_FILTER} & first_release_date > ${nowUnix};`,
    "sort first_release_date asc;",
    pageClause(page),
  ].join("\n");

// No content filters: a game the user already added is shown whatever its type
export const gamesByIdsQuery = (ids: number[]): string =>
  [GAME_FIELDS, `where id = (${ids.join(",")});`, `limit ${ids.length};`].join("\n");

export const gamesReleasingBetweenQuery = (
  fromUnix: number,
  toUnix: number,
  page: PageRequest
): string =>
  [
    GAME_FIELDS,
    `where ${BASE_FILTER} & first_release_date > ${fromUnix} & first_release_date < ${toUnix};`,
    "sort first_release_date asc;",
    pageClause(page),
  ].join("\n");
