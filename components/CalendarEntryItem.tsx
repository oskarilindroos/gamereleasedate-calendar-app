import { memo } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import * as Styled from "./styled/styles";
import { CalendarListItem } from "../hooks/useCalendarEntries";
import { coverURL } from "../services/igdb/mapGame";
import { igdbConfig } from "../config/env";
import { formatReleaseDate, formatReleasingIn } from "../utils/dates";

interface CalendarEntryItemProps {
  item: CalendarListItem;
  onRemove: (item: CalendarListItem) => void;
}

function CalendarEntryItem({ item, onRemove }: CalendarEntryItemProps) {
  const theme = useTheme();

  return (
    <Styled.CalendarEntryRow>
      <Styled.CalendarEntryCover
        source={{ uri: item.game?.coverURL ?? coverURL(igdbConfig.imageURL) }}
      />
      <Styled.CalendarEntryInfo>
        <Styled.GameCardName>{item.title}</Styled.GameCardName>
        <Styled.GameCardDate>
          {`${formatReleaseDate(item.releaseDate)} (${formatReleasingIn(item.releaseDate)})`}
        </Styled.GameCardDate>
        {item.game && item.game.platforms.length > 0 && (
          <Styled.GameCardDate>{item.game.platforms.join(", ")}</Styled.GameCardDate>
        )}
      </Styled.CalendarEntryInfo>
      <Pressable
        onPress={() => onRemove(item)}
        hitSlop={15}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.title}`}
      >
        <Ionicons name="trash-outline" size={26} color={theme.colors.primary} />
      </Pressable>
    </Styled.CalendarEntryRow>
  );
}

export default memo(CalendarEntryItem);
