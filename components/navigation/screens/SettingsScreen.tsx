import { Switch } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import * as Styled from "../../styled/styles";
import { useThemeMode } from "../../../context/ThemeModeContext";

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkTheme, setDarkTheme } = useThemeMode();

  return (
    <Styled.Wrapper>
      <Styled.ContentContainer>
        <Styled.Title>Settings</Styled.Title>
        <Styled.FlexRow>
          <Ionicons
            name={isDarkTheme ? "moon" : "sunny"}
            size={32}
            color={theme.colors.primary}
          />
          <Styled.Paragraph style={{ paddingLeft: 15 }}>
            Dark Mode
          </Styled.Paragraph>
          <Switch
            testID="dark-mode-switch"
            accessibilityLabel="Dark Mode"
            thumbColor={theme.colors.primary}
            style={{ marginLeft: "auto" }}
            onValueChange={setDarkTheme}
            value={isDarkTheme}
          />
        </Styled.FlexRow>
        <Styled.Divider />
      </Styled.ContentContainer>
    </Styled.Wrapper>
  );
}
