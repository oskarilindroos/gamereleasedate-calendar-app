// Mock IGDB server for running the app without real IGDB credentials.
//
//   npm run mock-api          (listens on http://localhost:4000)
//   npm run start:mock        (starts Expo pointed at the mock server)
//
// Endpoints:
//   POST /oauth2/token                 Twitch client credentials token
//   POST /v4/games                     IGDB games query (Apicalypse body)
//   GET  /images/:size/:imageId.(png|jpg)  Generated placeholder images
import { createServer } from "node:http";
import { handleMockRequest } from "./igdbMock.ts";
import { placeholderPng } from "./placeholderImage.ts";

const PORT = Number(process.env.PORT ?? 4000);

// Roughly the IGDB image sizes used by the app
const IMAGE_SIZES: Record<string, [number, number]> = {
  t_cover_big: [264, 352],
  t_screenshot_med_2x: [1138, 640],
};

const server = createServer((req, res) => {
  const url = req.url ?? "/";
  const image = /^\/images\/(\w+)\/(\w+)\.(png|jpg)$/.exec(url);

  if (req.method === "GET" && image) {
    const [width, height] = IMAGE_SIZES[image[1]] ?? [256, 256];
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(placeholderPng(image[2], width, height));
    console.log(`GET ${url}`);
    return;
  }

  let body = "";
  req.on("data", (data) => (body += data));
  req.on("end", () => {
    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([key, value]) => [key, String(value)])
    );
    const response = handleMockRequest({
      method: req.method ?? "GET",
      url,
      headers,
      body,
    });
    res.writeHead(response.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response.body));
    console.log(`${req.method} ${url} -> ${response.status}`);
  });
});

server.listen(PORT, () => {
  console.log(`Mock IGDB API listening on http://localhost:${PORT}`);
});
