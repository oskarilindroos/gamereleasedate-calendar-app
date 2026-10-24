import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "styled-components/native";
import { darkTheme, lightTheme } from "../components/styled/themes";

interface ThemeMode {
  isDarkTheme: boolean;
  setDarkTheme: (enabled: boolean) => void;
}

const ThemeModeContext = createContext<ThemeMode | null>(null);

// Provides the styled-components theme and a way to switch between dark and light.
// The initial theme follows the system setting.
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDarkTheme, setDarkTheme] = useState(systemScheme === "dark");

  const value = useMemo(() => ({ isDarkTheme, setDarkTheme }), [isDarkTheme]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = (): ThemeMode => {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return value;
};
