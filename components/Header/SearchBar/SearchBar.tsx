import { Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as NavigationService from "../../../services/NavigationService";
import * as Styled from "../../styled/styles";

export default function SearchBar() {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");

  // An empty search returns to the default "Games releasing soon" list
  const onSubmitSearch = () => {
    NavigationService.searchGames(searchPhrase);
  };

  return (
    <Styled.SearchBarContainer>
      <Pressable
        onPress={searchPhrase.length > 0 ? onSubmitSearch : undefined}
        hitSlop={20}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Ionicons
          style={{
            paddingLeft: 10,
            paddingRight: 5,
          }}
          name={"search"}
          size={22}
          color={theme.colors.primary}
        />
      </Pressable>
      <Styled.SearchBarTextInput
        testID="search-input"
        placeholder="Search games..."
        placeholderTextColor={theme.colors.secondary}
        cursorColor={theme.colors.primary}
        selectionColor={theme.colors.primary}
        value={searchPhrase}
        onSubmitEditing={onSubmitSearch}
        returnKeyType="search"
        autoCorrect={false}
        maxLength={40}
        onChangeText={setSearchPhrase}
        onFocus={() => setFocused(true)}
      />
      {focused && searchPhrase.length > 0 && (
        <Pressable
          onPress={() => setSearchPhrase("")}
          hitSlop={20}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons
            style={{
              paddingRight: 20,
            }}
            name={"close"}
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      )}
    </Styled.SearchBarContainer>
  );
}
