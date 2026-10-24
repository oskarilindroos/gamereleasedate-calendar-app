import { useCallback, useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useTheme } from "styled-components/native";
import * as Styled from "../../styled/styles";
import useGames from "../../../hooks/useGames";
import GameCard from "../../GameCard";
import GameCardModal from "../../GameCardModal";
import { Game } from "../../../types/games";
import { DrawerParamList } from "../../../types/navigation";
import { calcNumColumns } from "../../../utils/layout";

// ContentContainer is 90% of the window width
const CONTENT_WIDTH_RATIO = 0.9;

type Props = DrawerScreenProps<DrawerParamList, "Home">;

const HomeScreen = ({ route }: Props) => {
  const theme = useTheme();
  const searchPhrase = route.params?.searchPhrase;
  const { games, loading, error } = useGames(searchPhrase);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Game }) => <GameCard game={item} onPress={openGame} />,
    [openGame]
  );

  const { width } = useWindowDimensions();
  const numColumns = calcNumColumns(width * CONTENT_WIDTH_RATIO);

  return (
    <Styled.Wrapper>
      <Styled.ContentContainer style={{ marginTop: 0 }}>
        <FlatList
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          key={numColumns}
          numColumns={numColumns}
          data={games}
          keyExtractor={(game) => String(game.id)}
          renderItem={renderItem}
          initialNumToRender={10}
          ListHeaderComponentStyle={{
            justifyContent: "flex-start",
            alignSelf: "flex-start",
            marginTop: 20,
          }}
          ListHeaderComponent={
            <>
              <Styled.Title
                style={{
                  marginBottom: 10,
                }}
              >
                {searchPhrase
                  ? `Search results for '${searchPhrase}'`
                  : "Games releasing soon"}
              </Styled.Title>
              {games.length === 0 && !loading && (
                <Styled.Paragraph>
                  {error ? `No results. ${error}` : "No results"}
                </Styled.Paragraph>
              )}
            </>
          }
        />
        {loading && (
          <Styled.LoadingIcon
            testID="loading-indicator"
            size={"large"}
            color={theme.colors.primary}
          />
        )}
      </Styled.ContentContainer>
      <GameCardModal
        game={selectedGame}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onHidden={() => setSelectedGame(null)}
      />
    </Styled.Wrapper>
  );
};

export default HomeScreen;
