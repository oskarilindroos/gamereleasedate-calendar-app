import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import * as Styled from "../styled/styles";
import SearchBar from "./SearchBar/SearchBar";
import * as NavigationService from "../../services/NavigationService";

export default function Header() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Styled.HeaderContainer>
      <Styled.HeaderContent style={{ marginTop: insets.top + 12 }}>
        <Pressable
          onPress={() => NavigationService.toggleDrawer()}
          hitSlop={20}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Ionicons name={"menu"} size={50} color={theme.colors.primary} />
        </Pressable>
        <SearchBar />
      </Styled.HeaderContent>
    </Styled.HeaderContainer>
  );
}
