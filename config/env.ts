// Expo inlines EXPO_PUBLIC_* variables into the JS bundle at build time, so they
// must be referenced statically (no dynamic `process.env[name]` lookups).
// NOTE: anything here ships inside the app binary and is not truly secret.

export interface IgdbConfig {
  apiURL: string;
  imageURL: string;
  tokenURL: string;
  clientId: string;
  clientSecret: string;
}

export const igdbConfig: IgdbConfig = {
  apiURL: process.env.EXPO_PUBLIC_IGDB_API_URL || "https://api.igdb.com/v4",
  imageURL:
    process.env.EXPO_PUBLIC_IGDB_IMAGE_URL ||
    "https://images.igdb.com/igdb/image/upload",
  tokenURL:
    process.env.EXPO_PUBLIC_TWITCH_TOKEN_URL ||
    "https://id.twitch.tv/oauth2/token",
  clientId: process.env.EXPO_PUBLIC_IGDB_CLIENT_ID ?? "",
  clientSecret: process.env.EXPO_PUBLIC_IGDB_CLIENT_SECRET ?? "",
};
