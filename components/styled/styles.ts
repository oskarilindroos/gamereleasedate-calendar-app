import { styled } from "styled-components/native";
import { Image } from "expo-image";

export const Wrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
  height: 100%;
`;

export const Paragraph = styled.Text`
  margin-top: 10px;
  font-family: MontserratSemiBold;
  font-size: ${({ theme }) => theme.fontSizes.m}px;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const ParagraphPrimaryColor = styled(Paragraph)`
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  font-family: MontserratSemiBold;
  font-size: ${({ theme }) => theme.fontSizes.xl}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const HeaderContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.headerBackground};
  border-bottom-width: 2px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

// margin-top is set from the safe area insets in Header
export const HeaderContent = styled.View`
  margin-bottom: 10px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  flex-direction: row;
  align-items: center;
`;

export const SearchBarContainer = styled.View`
  width: 75%;
  max-width: 600px;
  border-radius: 200px;
  border: 2px solid ${({ theme }) => theme.colors.divider};
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.secondaryBackground};
  align-items: center;
  margin-left: auto;
  margin-right: auto;
`;

export const SearchBarTextInput = styled.TextInput`
  flex: 1;
  padding: 7px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: MontserratSemiBold;
`;

export const ContentContainer = styled.View`
  width: 90%;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
`;

export const GameCard = styled.View`
  border-radius: ${({ theme }) => theme.borderRadius}px;
  background-color: ${({ theme }) => theme.colors.background};
  width: 150px;
  margin-top: 20px;
  margin-right: 10px;
`;

export const GameCardImage = styled(Image)`
  width: 150px;
  height: 200px;
  border-radius: ${({ theme }) => theme.borderRadius}px;
  background-color: ${({ theme }) => theme.colors.placeholder};
`;

// Loading placeholder with the same size and spacing as GameCard
export const GameCardSkeleton = styled.View`
  width: 150px;
  margin-top: 20px;
  margin-right: 10px;
`;

export const SkeletonBlock = styled.View`
  border-radius: ${({ theme }) => theme.borderRadius}px;
  background-color: ${({ theme }) => theme.colors.placeholder};
`;

export const SkeletonLine = styled.View`
  height: 12px;
  margin-top: 10px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.placeholder};
`;

export const ListFooter = styled.View`
  align-items: center;
  padding: 20px 0;
`;

export const GameCardName = styled.Text`
  margin-top: 10px;
  overflow: hidden;
  font-family: MontserratSemiBold;
  font-size: ${({ theme }) => theme.fontSizes.m}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const GameCardDate = styled.Text`
  font-family: MontserratSemiBold;
  font-size: ${({ theme }) => theme.fontSizes.s}px;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const GameSummaryContainer = styled.View`
  margin-top: 5px;
`;

export const GameSummaryText = styled.Text`
  font-family: MontserratSemiBold;
  font-size: ${({ theme }) => theme.fontSizes.m}px;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const GameModalContainer = styled.ScrollView`
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

// Wraps the scrolling content so the close button can float over it
export const GameModalFrame = styled.View`
  flex-shrink: 1;
`;

// Dark translucent circle so the icon stays visible on top of screenshots
export const ModalCloseButton = styled.Pressable`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const GameModalContentContainer = styled.View`
  flex-direction: column;
`;

export const GameModalContentRow = styled.View`
  padding: 20px;
`;

// Stays below the scrolling details so the action is always visible
export const GameModalFooter = styled.View`
  padding: 15px 20px 20px;
  border-top-width: 2px;
  border-top-color: ${({ theme }) => theme.colors.divider};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const PrimaryButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 50px;
  border-radius: ${({ theme }) => theme.borderRadius}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const PrimaryButtonText = styled.Text`
  font-family: MontserratSemiBold;
  font-size: ${({ theme }) => theme.fontSizes.l}px;
  color: ${({ theme }) => theme.colors.background};
`;

export const DrawerContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

export const FlexRow = styled.View`
  margin-top: 20px;
  padding-bottom: 5px;
  flex-direction: row;
  align-items: center;
`;

export const Divider = styled.View`
  background-color: ${({ theme }) => theme.colors.divider};
  height: 2px;
  width: 100%;
`;

export const LoadingIcon = styled.ActivityIndicator`
  align-items: center;
  justify-content: center;
`;

export const CalendarEntryRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
  border-bottom-width: 2px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

export const CalendarEntryCover = styled(Image)`
  width: 60px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius / 2}px;
  background-color: ${({ theme }) => theme.colors.placeholder};
`;

export const CalendarEntryInfo = styled.View`
  flex: 1;
  margin: 0 15px;
`;
