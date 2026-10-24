# Introduction
React Native app for easily adding game release dates to your calendar as events. A personal project of mine.

# Technologies

- React Native 0.88 + Expo SDK 58 (iOS and Android)
- TypeScript, styled-components, React Navigation 7
- Expo Calendar API
- IGDB API (for searching games and release dates)
- Jest + React Native Testing Library, Maestro (end-to-end)

# Getting started

Requirements: Node 22.18+, Xcode (iOS) and/or Android Studio + JDK 17 (Android), [Watchman](https://facebook.github.io/watchman/) recommended.

```sh
npm install
cp .env.example .env   # fill in your IGDB (Twitch) client id + secret
```

The app uses a native module API (`expo-calendar`'s object API) that isn't available in Expo Go, so it runs as a
[development build](https://docs.expo.dev/develop/development-builds/introduction/):

```sh
npm run ios       # build + run on the iOS simulator (npx expo run:ios)
npm run android   # build + run on an Android emulator/device
npm start         # only start Metro for an already installed development build
```

The `ios/` and `android/` folders are generated (`npx expo prebuild`) and not committed.

## Running on an iPhone

1. Make sure Xcode is the active developer directory: `sudo xcode-select -s /Applications/Xcode.app`
2. Enable *Developer Mode* on the iPhone (Settings → Privacy & Security → Developer Mode) and connect it with a cable.
3. Generate the native project and pick a signing team:
   ```sh
   npx expo prebuild --platform ios
   open ios/GameReleaseCalendar.xcworkspace
   ```
   In Xcode: *GameReleaseCalendar* target → *Signing & Capabilities* → choose your team (a free Apple ID "Personal Team" works).
   If the bundle identifier is taken, change `ios.bundleIdentifier` in `app.json` and run prebuild again.
4. Install and run:
   ```sh
   npx expo run:ios --device                          # development build, loads JS from Metro (same Wi-Fi as the Mac)
   npx expo run:ios --device --configuration Release  # standalone build, works without the Mac
   ```
   With a free Apple ID the app has to be reinstalled every 7 days. With a paid Apple Developer account you can instead
   use EAS: `eas device:create`, then `eas build --profile preview --platform ios`.

# Mock IGDB API

`mock-igdb/` contains an in-memory imitation of the Twitch token + IGDB `/games` endpoints (it understands the
Apicalypse queries the app sends) with fictional games and generated placeholder images. It's used by the Jest tests
and can also serve the app, so no IGDB credentials are needed for development:

```sh
npm run mock-api     # http://localhost:4000
npm run start:mock   # Metro with the app pointed at the mock API
```

Then open the development build in the iOS simulator (or `adb reverse tcp:4000 tcp:4000` for an Android emulator).

# Tests

```sh
npm test            # unit + integration tests (Jest)
npm run typecheck
npm run lint
npm run e2e         # Maestro flows on the iOS simulator (needs `mock-api` + `start:mock` running
                    # and the development build installed). Install Maestro: https://maestro.dev
```

# Project structure

```
App.tsx                 providers (theme, games service, navigation) and root layout
components/             UI components and screens
context/                React contexts (theme mode, games service injection)
hooks/                  useGames (loading/search state), useCalendar
services/igdb/          IGDB client: auth token provider, query builders, response mapping
services/calendar/      adding release dates to the device calendar
config/env.ts           EXPO_PUBLIC_* configuration
mock-igdb/              mock IGDB API (tests + local server)
.maestro/               end-to-end flows
```

# Project goals

- To learn React Native
- To learn theming for React
- To learn TypeScript
- To learn Figma and UI/UX design
- To learn mobile development
- To make an app that is actually useful (at least for me)

# Design

[Current prototype in Figma](https://www.figma.com/proto/mv5lKRJEosANrBMU9ozkWz/Mobile-APP?node-id=1%3A13&scaling=scale-down&page-id=0%3A1&starting-point-node-id=1%3A13)

![Home page](assets/prototype/home.jpg)
![Home page 2](assets/prototype/home_2.jpg)
![Home page 2](assets/prototype/search_results.jpg)
![Home page 2](assets/prototype/settings.jpg)
