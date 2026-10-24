import {
  escapeQueryString,
  gamesReleasingBetweenQuery,
  searchUpcomingGamesQuery,
} from "./queries";

describe("escapeQueryString", () => {
  it("escapes quotes and backslashes", () => {
    expect(escapeQueryString('Say "hi" \\o/')).toBe('Say \\"hi\\" \\\\o/');
  });
});

describe("searchUpcomingGamesQuery", () => {
  it("searches upcoming games by name, sorted by release date", () => {
    const query = searchUpcomingGamesQuery("  zelda ", 1_000);

    expect(query).toContain('where name ~ *"zelda"*');
    expect(query).toContain("first_release_date > 1000;");
    expect(query).toContain('themes.slug != "erotic"');
    expect(query).toContain("version_parent = null");
    expect(query).toContain("sort first_release_date asc;");
    expect(query).toContain("limit 200;");
  });

  it("can't be broken by quotes in the search phrase", () => {
    const query = searchUpcomingGamesQuery('a"; limit 1; "', 0);
    expect(query).toContain('name ~ *"a\\"; limit 1; \\""*');
  });
});

describe("gamesReleasingBetweenQuery", () => {
  it("filters games by release date range", () => {
    const query = gamesReleasingBetweenQuery(100, 200);

    expect(query).toContain("first_release_date > 100 & first_release_date < 200;");
    expect(query).toContain("limit 400;");
  });
});
