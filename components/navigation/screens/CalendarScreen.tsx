import { useCallback } from "react";
import { Alert, FlatList } from "react-native";
import { useTheme } from "styled-components/native";
import * as Styled from "../../styled/styles";
import CalendarEntryItem from "../../CalendarEntryItem";
import useCalendarEntries, { CalendarListItem } from "../../../hooks/useCalendarEntries";

export default function CalendarScreen() {
  const theme = useTheme();
  const { items, loading, error, permissionDenied, remove } = useCalendarEntries();

  const confirmRemove = useCallback(
    (item: CalendarListItem) =>
      Alert.alert("Remove from calendar?", `${item.title} will be removed from your calendar.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => remove(item) },
      ]),
    [remove]
  );

  const renderItem = useCallback(
    ({ item }: { item: CalendarListItem }) => (
      <CalendarEntryItem item={item} onRemove={confirmRemove} />
    ),
    [confirmRemove]
  );

  const emptyMessage = permissionDenied
    ? "Allow calendar access in Settings to see the games you've added."
    : error ?? "No games added yet. Open a game and tap the calendar icon to add its release date.";

  return (
    <Styled.Wrapper>
      <Styled.ContentContainer style={{ flex: 1, marginTop: 0 }}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.eventId}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <Styled.Title style={{ marginTop: 20, marginBottom: 10 }}>
              Added to calendar
            </Styled.Title>
          }
          ListEmptyComponent={
            loading ? (
              <Styled.LoadingIcon
                testID="loading-indicator"
                size={"large"}
                color={theme.colors.primary}
              />
            ) : (
              <Styled.Paragraph>{emptyMessage}</Styled.Paragraph>
            )
          }
        />
      </Styled.ContentContainer>
    </Styled.Wrapper>
  );
}
