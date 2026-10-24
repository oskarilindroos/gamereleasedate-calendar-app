import { DefaultTheme } from "styled-components/native";

export const darkTheme: DefaultTheme = {
  name: "dark-theme",
  borderRadius: 15,
  colors: {
    primary: "#6ED4FF",
    secondary: "#347F9F",
    background: "#06081F",
    success: "#6effe2",
    secondaryBackground: "#0d1246",
    headerBackground: "#06081F",
    divider: "#001b36",
    placeholder: "#0d1246",
    gradients: ["#06081F", "#111a6a"],
    gradients2: ["#111a6a", "#06081F"],
  },
  fontSizes: {
    s: 12,
    m: 16,
    l: 18,
    xl: 22,
  },
};

export const lightTheme: DefaultTheme = {
  name: "light-theme",
  borderRadius: 15,

  colors: {
    primary: "black",
    secondary: "gray",
    background: "white",
    success: "#00ff7b",
    secondaryBackground: "#ffffff",
    headerBackground: "#f6f6f6",
    divider: "gray",
    placeholder: "#e8e8e8",
    gradients: ["white", "#9f9f9f"],
    gradients2: ["#111a6a", "#06081F"],
  },
  fontSizes: {
    s: 12,
    m: 16,
    l: 18,
    xl: 22,
  },
};
