import { useCallback, useState } from "react";
import { FlatList, Pressable, useWindowDimensions } from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useTheme } from "styled-components/native";
import * as Styled from "../../styled/styles";
import useGames from "../../../hooks/useGames";
import GameCard from "../../GameCard";
import GameCardModal from "../../GameCardModal";
import GameGridSkeleton from "../../GameGridSkeleton";
import { Game } from "../../../types/games";
import { DrawerParamList } from "../../../types/navigation";
import { calcNumColumns } from "../../../utils/layout";

// ContentContainer is 90% of the window width
const CONTENT_WIDTH_RATIO = 0.9;
// Start loading the next page when the end is this many screen heights away
const LOAD_MORE_THRESHOLD = 1.5;

type Props = DrawerScreenProps<DrawerParamList, "Home">;

const HomeScreen = ({ route }: Props) => {
  const theme = useTheme();
  const searchPhrase = route.params?.searchPhrase;
  const { games, loading, error, loadingMore, loadMoreFailed, loadMore } =
    useGames(searchPhrase);

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
          // Render roughly a screenful up front and keep a few screens around it mounted
          initialNumToRender={numColumns * 4}
          maxToRenderPerBatch={numColumns * 4}
          windowSize={7}
          onEndReached={loadMore}
          onEndReachedThreshold={LOAD_MORE_THRESHOLD}
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
          ListEmptyComponent={
            loading ? <GameGridSkeleton numColumns={numColumns} /> : undefined
          }
          ListFooterComponent={
            <Styled.ListFooter>
              {loadingMore && (
                <Styled.LoadingIcon
                  testID="loading-more-indicator"
                  size={"small"}
                  color={theme.colors.primary}
                />
              )}
              {loadMoreFailed && (
                <Pressable onPress={loadMore} accessibilityRole="button">
                  <Styled.Paragraph>
                    {"Couldn't load more games. Tap to try again."}
                  </Styled.Paragraph>
                </Pressable>
              )}
            </Styled.ListFooter>
          }
        />
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
