import { ReactElement } from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "styled-components/native";
import { darkTheme } from "../components/styled/themes";

export const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
