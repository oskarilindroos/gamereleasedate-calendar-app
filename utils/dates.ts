import { format, formatDistance } from "date-fns";

// IGDB stores release dates as midnight UTC of the release day. Converting the UTC
// calendar day to local midnight keeps the date stable in every time zone
// (otherwise e.g. users in the Americas would see the game release a day early).
export const releaseDayFromUnix = (unixSeconds: number): Date => {
  const utc = new Date(unixSeconds * 1000);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
};

// e.g. "Nov 7, 2026"
export const formatReleaseDate = (date: Date): string =>
  format(date, "MMM d, yyyy");

// e.g. "in 14 days"
export const formatReleasingIn = (date: Date, now: Date = new Date()): string =>
  formatDistance(date, now, { addSuffix: true });

export const toUnixSeconds = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

export const DAY_IN_SECONDS = 24 * 60 * 60;
