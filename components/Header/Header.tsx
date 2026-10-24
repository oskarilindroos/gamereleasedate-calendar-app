import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import * as Styled from "../styled/styles";
import SearchBar from "./SearchBar/SearchBar";
import * as NavigationService from "../../services/NavigationService";

export default function Header() {
  const theme = useTheme();

  return (
    <Styled.HeaderContainer>
      <Styled.HeaderContent>
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
