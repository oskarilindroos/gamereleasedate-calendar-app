import { createTwitchTokenProvider } from "./twitchTokenProvider";

const tokenResponse = (token: string, expiresIn = 3600) =>
  ({
    ok: true,
    status: 200,
    json: async () => ({ access_token: token, expires_in: expiresIn }),
  }) as Response;

const setup = (now = { value: 0 }) => {
  const fetchFn = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
  const provider = createTwitchTokenProvider({
    tokenURL: "https://id.example.com/oauth2/token",
    clientId: "id",
    clientSecret: "secret",
    fetchFn: fetchFn as unknown as typeof fetch,
    now: () => now.value,
  });
  return { fetchFn, provider, now };
};

describe("twitchTokenProvider", () => {
  it("requests a client credentials token", async () => {
    const { fetchFn, provider } = setup();
    fetchFn.mockResolvedValue(tokenResponse("abc"));

    await expect(provider.getToken()).resolves.toBe("abc");
    expect(fetchFn).toHaveBeenCalledWith(
      "https://id.example.com/oauth2/token?client_id=id&client_secret=secret&grant_type=client_credentials",
      { method: "POST" }
    );
  });

  it("caches the token until it is about to expire", async () => {
    const { fetchFn, provider, now } = setup();
    fetchFn
      .mockResolvedValueOnce(tokenResponse("first", 3600))
      .mockResolvedValueOnce(tokenResponse("second", 3600));

    await provider.getToken();
    now.value = 3000 * 1000;
    await expect(provider.getToken()).resolves.toBe("first");

    now.value = 3590 * 1000; // within the one minute safety margin
    await expect(provider.getToken()).resolves.toBe("second");
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("shares one request between concurrent callers", async () => {
    const { fetchFn, provider } = setup();
    fetchFn.mockResolvedValue(tokenResponse("abc"));

    await Promise.all([provider.getToken(), provider.getToken()]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("fetches a new token after invalidate()", async () => {
    const { fetchFn, provider } = setup();
    fetchFn
      .mockResolvedValueOnce(tokenResponse("first"))
      .mockResolvedValueOnce(tokenResponse("second"));

    await provider.getToken();
    provider.invalidate();
    await expect(provider.getToken()).resolves.toBe("second");
  });

  it("rejects when the token request fails, and retries next time", async () => {
    const { fetchFn, provider } = setup();
    fetchFn
      .mockResolvedValueOnce({ ok: false, status: 403 } as Response)
      .mockResolvedValueOnce(tokenResponse("abc"));

    await expect(provider.getToken()).rejects.toThrow("(403)");
    await expect(provider.getToken()).resolves.toBe("abc");
  });

  it("rejects without making a request when credentials are missing", async () => {
    const fetchFn = jest.fn();
    const provider = createTwitchTokenProvider({
      tokenURL: "https://id.example.com/oauth2/token",
      clientId: "",
      clientSecret: "",
      fetchFn,
    });

    await expect(provider.getToken()).rejects.toThrow("credentials are missing");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
