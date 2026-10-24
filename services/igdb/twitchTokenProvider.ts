// IGDB uses Twitch OAuth client credentials for authentication.
// https://api-docs.igdb.com/#authentication

export interface TokenProvider {
  getToken(): Promise<string>;
  // Forget the cached token, e.g. after the API rejected it
  invalidate(): void;
}

interface TwitchTokenProviderOptions {
  tokenURL: string;
  clientId: string;
  clientSecret: string;
  fetchFn?: typeof fetch;
  now?: () => number;
}

// Refresh a minute before the token actually expires
const EXPIRY_MARGIN_MS = 60_000;

export const createTwitchTokenProvider = ({
  tokenURL,
  clientId,
  clientSecret,
  fetchFn = fetch,
  now = Date.now,
}: TwitchTokenProviderOptions): TokenProvider => {
  let cached: { token: string; expiresAt: number } | null = null;
  // Share a single in-flight request between concurrent callers
  let pending: Promise<string> | null = null;

  const requestToken = async (): Promise<string> => {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });
    const response = await fetchFn(`${tokenURL}?${params.toString()}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Fetching access token failed (${response.status})`);
    }
    const body: { access_token: string; expires_in: number } =
      await response.json();
    cached = {
      token: body.access_token,
      expiresAt: now() + body.expires_in * 1000 - EXPIRY_MARGIN_MS,
    };
    return body.access_token;
  };

  return {
    getToken() {
      if (!clientId || !clientSecret) {
        return Promise.reject(
          new Error("IGDB credentials are missing. See README for setup.")
        );
      }
      if (cached && cached.expiresAt > now()) {
        return Promise.resolve(cached.token);
      }
      if (!pending) {
        pending = requestToken().finally(() => {
          pending = null;
        });
      }
      return pending;
    },
    invalidate() {
      cached = null;
    },
  };
};
