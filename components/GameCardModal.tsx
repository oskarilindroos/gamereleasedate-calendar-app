import { useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import useCalendar from "../hooks/useCalendar";
import ScreenshotCarousel from "./ScreenshotCarousel";
import SlideUpModal from "./SlideUpModal";
import * as Styled from "./styled/styles";
import { Game } from "../types/games";
import { formatReleaseDate, formatReleasingIn } from "../utils/dates";

// Screens shorter than this in landscape (phones) show the screenshots next to
// the details instead of above them
const SIDE_BY_SIDE_MAX_HEIGHT = 600;

interface ModalProps {
  game: Game | null;
  visible: boolean;
  onClose: () => void;
  // Called once the hide animation has finished
  onHidden?: () => void;
}

export default function GameCardModal({
  game,
  visible,
  onClose,
  onHidden,
}: ModalProps) {
  const theme = useTheme();
  const { addEvent, adding } = useCalendar();
  const window = useWindowDimensions();
  const sideBySide = window.width > window.height && window.height < SIDE_BY_SIDE_MAX_HEIGHT;
  const hasScreenshots = (game?.screenshotURLs.length ?? 0) > 0;

  return (
    <SlideUpModal
      visible={visible && game !== null}
      onClose={onClose}
      onHidden={onHidden}
      style={{
        width: "100%",
        maxWidth: 700,
        alignSelf: "center",
      }}
    >
      {game && (
        <Styled.GameModalFrame style={sideBySide && { flex: 1, flexDirection: "row" }}>
          {sideBySide && hasScreenshots && (
            <View style={{ flex: 1 }}>
              <ScreenshotCarousel urls={game.screenshotURLs} fill />
            </View>
          )}
          <View style={sideBySide ? { flex: 1 } : { flexShrink: 1 }}>
            <Styled.GameModalContainer testID="game-modal">
              {!sideBySide && hasScreenshots && (
                <ScreenshotCarousel urls={game.screenshotURLs} />
              )}
              <Styled.GameModalContentContainer>
                <Styled.GameModalContentRow>
                  <Styled.Title>{game.name}</Styled.Title>
                  <Styled.ParagraphPrimaryColor>
                    Release date:
                    <Styled.Paragraph>
                      {` ${formatReleaseDate(game.releaseDate)} (${formatReleasingIn(game.releaseDate)})`}
                    </Styled.Paragraph>
                  </Styled.ParagraphPrimaryColor>
                  <Styled.ParagraphPrimaryColor>
                    Releasing on:{" "}
                    <Styled.Paragraph>
                      {game.platforms.join(", ")}
                    </Styled.Paragraph>
                  </Styled.ParagraphPrimaryColor>
                  {game.summary && (
                    <Styled.GameSummaryContainer>
                      <Styled.GameSummaryText>{`"${game.summary}"`}</Styled.GameSummaryText>
                    </Styled.GameSummaryContainer>
                  )}
                </Styled.GameModalContentRow>
              </Styled.GameModalContentContainer>
            </Styled.GameModalContainer>
            <Styled.GameModalFooter>
              <Styled.PrimaryButton
                onPress={() => addEvent(game)}
                disabled={adding}
                style={{ opacity: adding ? 0.7 : 1 }}
                accessibilityRole="button"
                accessibilityLabel="Add to calendar"
                accessibilityState={{ busy: adding }}
                testID="add-to-calendar"
              >
                {adding ? (
                  <Styled.LoadingIcon color={theme.colors.background} />
                ) : (
                  <Ionicons name="calendar-outline" size={22} color={theme.colors.background} />
                )}
                <Styled.PrimaryButtonText>Add to calendar</Styled.PrimaryButtonText>
              </Styled.PrimaryButton>
            </Styled.GameModalFooter>
          </View>
          <Styled.ModalCloseButton
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close"
            testID="close-game-modal"
          >
            <Ionicons name="close" size={24} color="white" />
          </Styled.ModalCloseButton>
        </Styled.GameModalFrame>
      )}
    </SlideUpModal>
  );
}
