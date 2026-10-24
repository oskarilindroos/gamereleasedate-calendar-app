// A small in-memory imitation of the Twitch OAuth + IGDB /games endpoints.
// It interprets the subset of the Apicalypse query language that the app uses
// (name search, release date range, version_parent/theme filters, sort, limit),
// so the app's real HTTP client and query builders are exercised against it.
//
// Used by the Jest tests (via createMockFetch) and by the dev server (server.ts).
// Only erasable TypeScript syntax is used so Node can run it without a build step.

import { mockGames, type MockGameFixture } from "./fixtures.ts";

export const MOCK_CLIENT_ID = "mock-client-id";
export const MOCK_CLIENT_SECRET = "mock-client-secret";
export const MOCK_ACCESS_TOKEN = "mock-access-token";

const DAY_SECONDS = 24 * 60 * 60;

export interface MockResponse {
  status: number;
  body: unknown;
}

export interface MockRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

// IGDB release dates are midnight UTC
const releaseTimestamp = (releaseInDays: number, now: Date) => {
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return todayUtc / 1000 + releaseInDays * DAY_SECONDS;
};

const toApiGame = (game: MockGameFixture, now: Date) => ({
  id: game.id,
  name: game.name,
  first_release_date: releaseTimestamp(game.releaseInDays, now),
  ...(game.summary && { summary: game.summary }),
  ...(game.coverImageId && {
    cover: { id: game.id * 10, image_id: game.coverImageId },
  }),
  ...(game.screenshotImageIds && {
    screenshots: game.screenshotImageIds.map((image_id, i) => ({
      id: game.id * 10 + i,
      image_id,
    })),
  }),
  ...(game.platforms && {
    platforms: game.platforms.map((abbreviation, i) =>
      abbreviation ? { id: i + 1, abbreviation } : { id: i + 1 }
    ),
  }),
});

const unescapeQueryString = (value: string) => value.replace(/\\(.)/g, "$1");

// Interprets the Apicalypse body sent by the app
export const queryMockGames = (query: string, now: Date = new Date()) => {
  const where = /where ([\s\S]*?);/.exec(query)?.[1] ?? "";
  const search = /name ~ \*"((?:[^"\\]|\\.)*)"\*/.exec(where)?.[1];
  const after = /first_release_date > (\d+)/.exec(where)?.[1];
  const before = /first_release_date < (\d+)/.exec(where)?.[1];
  const limit = Number(/limit (\d+);/.exec(query)?.[1] ?? 10);
  const excludeVersions = where.includes("version_parent = null");
  const excludedTheme = /themes\.slug != "(\w+)"/.exec(where)?.[1];

  return mockGames
    .filter((game) => !(excludeVersions && game.versionParent))
    .filter(
      (game) => !(excludedTheme && game.themeSlugs?.includes(excludedTheme))
    )
    .map((game) => toApiGame(game, now))
    .filter(
      (game) =>
        search === undefined ||
        game.name.toLowerCase().includes(unescapeQueryString(search).toLowerCase())
    )
    .filter((game) => after === undefined || game.first_release_date > Number(after))
    .filter((game) => before === undefined || game.first_release_date < Number(before))
    .sort((a, b) => a.first_release_date - b.first_release_date)
    .slice(0, limit);
};

export const handleMockRequest = (
  { method, url, headers = {}, body = "" }: MockRequest,
  now: Date = new Date()
): MockResponse => {
  const { pathname, searchParams } = new URL(url, "http://localhost");
  const header = (name: string) =>
    Object.entries(headers).find(
      ([key]) => key.toLowerCase() === name.toLowerCase()
    )?.[1];

  if (method === "POST" && pathname.endsWith("/oauth2/token")) {
    // Twitch documents a form-encoded body; it also accepts query string parameters
    const form = new URLSearchParams(body);
    const param = (name: string) => form.get(name) ?? searchParams.get(name);
    if (
      param("client_id") !== MOCK_CLIENT_ID ||
      param("client_secret") !== MOCK_CLIENT_SECRET ||
      param("grant_type") !== "client_credentials"
    ) {
      return { status: 403, body: { status: 403, message: "invalid client secret" } };
    }
    return {
      status: 200,
      body: { access_token: MOCK_ACCESS_TOKEN, expires_in: 5_000_000, token_type: "bearer" },
    };
  }

  if (method === "POST" && pathname.endsWith("/games")) {
    if (
      header("Client-ID") !== MOCK_CLIENT_ID ||
      header("Authorization") !== `Bearer ${MOCK_ACCESS_TOKEN}`
    ) {
      return { status: 401, body: { message: "Authorization Failure" } };
    }
    return { status: 200, body: queryMockGames(body, now) };
  }

  return { status: 404, body: { message: "Not found" } };
};

// fetch-compatible function backed by the mock, for tests
export const createMockFetch = (now: () => Date = () => new Date()) =>
  (async (input: string | URL | Request, init: RequestInit = {}) => {
    const { status, body } = handleMockRequest(
      {
        method: init.method ?? "GET",
        url: input.toString(),
        headers: init.headers as Record<string, string> | undefined,
        body: typeof init.body === "string" ? init.body : undefined,
      },
      now()
    );
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response;
  }) as typeof fetch;
