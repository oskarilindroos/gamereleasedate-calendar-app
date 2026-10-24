import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner-native";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { navigationRef } from "./services/NavigationService";
import DrawerNavigator from "./components/navigation/DrawerNavigator";
import Header from "./components/Header/Header";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeModeContext";
import { GamesServiceProvider } from "./context/GamesServiceContext";
import { GamesService } from "./services/GamesService";
import { createIgdbGamesService } from "./services/igdb/igdbGamesService";
import { createTwitchTokenProvider } from "./services/igdb/twitchTokenProvider";
import { igdbConfig } from "./config/env";
import { createQueryClient, useAppStateFocus } from "./services/query/queryClient";

SplashScreen.preventAutoHideAsync();

const createDefaultGamesService = (): GamesService =>
  createIgdbGamesService({
    apiURL: igdbConfig.apiURL,
    imageURL: igdbConfig.imageURL,
    clientId: igdbConfig.clientId,
    tokenProvider: createTwitchTokenProvider(igdbConfig),
  });

function ThemedApp() {
  const theme = useTheme();
  const { isDarkTheme } = useThemeMode();

  // Match react-navigation's own colors (e.g. behind the sliding drawer) to the app theme
  const navigationTheme: NavigationTheme = useMemo(() => {
    const base = isDarkTheme ? DarkTheme : NavigationLightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.background,
      },
    };
  }, [isDarkTheme, theme]);

  return (
    <>
      <Header />
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <DrawerNavigator />
      </NavigationContainer>
      <Toaster theme={isDarkTheme ? "dark" : "light"} position="bottom-center" />
    </>
  );
}

interface AppProps {
  // Allows tests to inject their own games data source and query settings
  gamesService?: GamesService;
  queryClient?: QueryClient;
}

export default function App({ gamesService, queryClient }: AppProps) {
  const service = useMemo(
    () => gamesService ?? createDefaultGamesService(),
    [gamesService]
  );
  const [defaultQueryClient] = useState(createQueryClient);
  useAppStateFocus();

  const [fontsLoaded, fontError] = useFonts({
    MontserratRegular: require("./assets/fonts/Montserrat-Regular.ttf"),
    MontserratSemiBold: require("./assets/fonts/Montserrat-SemiBold.ttf"),
    MontserratBold: require("./assets/fonts/Montserrat-Bold.ttf"),
    MontserratItalic: require("./assets/fonts/Montserrat-Italic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeModeProvider>
          <QueryClientProvider client={queryClient ?? defaultQueryClient}>
            <GamesServiceProvider service={service}>
              <ThemedApp />
            </GamesServiceProvider>
          </QueryClientProvider>
        </ThemeModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
