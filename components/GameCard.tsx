import { memo } from "react";
import { Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import * as Styled from "./styled/styles";
import { Game } from "../types/games";
import { formatReleaseDate } from "../utils/dates";

interface GameCardProps {
  game: Game;
  onPress: (game: Game) => void;
}

function GameCard({ game, onPress }: GameCardProps) {
  const theme = useTheme();

  return (
    <Styled.GameCard>
      <Pressable
        onPress={() => onPress(game)}
        style={{ borderRadius: theme.borderRadius }}
        accessibilityRole="button"
        accessibilityLabel={`${game.name} details`}
      >
        <Styled.GameCardImage
          source={{
            uri: game.coverURL,
          }}
          // Fade in when loaded; the list recycles cards, so tie the image to the game
          transition={200}
          recyclingKey={String(game.id)}
        />
      </Pressable>
      <Styled.GameCardName>{game.name}</Styled.GameCardName>
      <Styled.GameCardDate>{formatReleaseDate(game.releaseDate)}</Styled.GameCardDate>
    </Styled.GameCard>
  );
}

export default memo(GameCard);
