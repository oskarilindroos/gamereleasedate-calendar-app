import { formatReleaseDate, formatReleasingIn, releaseDayFromUnix, toUnixSeconds } from "./dates";

describe("releaseDayFromUnix", () => {
  it("returns local midnight of the UTC calendar day", () => {
    // 2026-11-07T00:00:00Z (how IGDB stores release dates)
    const day = releaseDayFromUnix(Date.UTC(2026, 10, 7) / 1000);

    expect(day.getFullYear()).toBe(2026);
    expect(day.getMonth()).toBe(10);
    expect(day.getDate()).toBe(7);
    expect(day.getHours()).toBe(0);
  });

  it("ignores the time of day of the timestamp", () => {
    const day = releaseDayFromUnix(Date.UTC(2026, 10, 7, 23, 59) / 1000);
    expect(day.getDate()).toBe(7);
  });
});

describe("formatting", () => {
  it("formats the release date like 'Nov 7, 2026'", () => {
    expect(formatReleaseDate(new Date(2026, 10, 7))).toBe("Nov 7, 2026");
  });

  it("describes how far away the release is", () => {
    const now = new Date(2026, 9, 24);
    expect(formatReleasingIn(new Date(2026, 10, 7), now)).toBe("in 14 days");
    expect(formatReleasingIn(new Date(2027, 2, 1), now)).toBe("in 4 months");
  });

  it("converts dates to unix seconds", () => {
    expect(toUnixSeconds(new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 999)))).toBe(
      Date.UTC(2026, 0, 1) / 1000
    );
  });
});
