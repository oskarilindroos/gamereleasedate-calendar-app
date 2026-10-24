import { useState } from "react";
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Carousel, Pagination } from "react-native-reanimated-carousel";
import { fitContainer, Gallery, type VerticalPullOptions } from "react-native-zoom-toolkit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import * as Styled from "./styled/styles";

const IMAGE_HEIGHT = 400;
// IGDB screenshot sizes are all cropped to 16:9 (https://api-docs.igdb.com/#images),
// so the preview doesn't need to download an image to learn its size
const SCREENSHOT_ASPECT_RATIO = 16 / 9;
// Pulling the preview down this far closes it
const CLOSE_PULL_DISTANCE = 120;

interface CarouselProps {
  urls: string[];
}

// Full screen, zoomable image viewer with a blurred copy of the current image as background
function ScreenshotPreview({
  urls,
  initialIndex,
  onClose,
}: {
  urls: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const imageSize = fitContainer(SCREENSHOT_ASPECT_RATIO, window);

  // Runs on the UI thread on every frame of the pull
  const closeOnPull = ({ translateY, released }: VerticalPullOptions) => {
    "worklet";
    if (released && translateY > CLOSE_PULL_DISTANCE) scheduleOnRN(onClose);
  };

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      {/* Modals are rendered outside the app's root view, so gestures need their own */}
      <GestureHandlerRootView
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}
      >
        <Image source={{ uri: urls[index] }} style={StyleSheet.absoluteFill} blurRadius={100} />
        <Gallery
          data={urls}
          keyExtractor={(url) => url}
          initialIndex={initialIndex}
          onIndexChange={setIndex}
          onVerticalPull={closeOnPull}
          renderItem={(url) => (
            <Image source={{ uri: url }} style={imageSize} contentFit="contain" />
          )}
        />
        <Styled.ModalCloseButton
          onPress={onClose}
          hitSlop={10}
          style={{ top: insets.top + 10 }}
          accessibilityRole="button"
          accessibilityLabel="Close preview"
        >
          <Ionicons name="close" size={24} color="white" />
        </Styled.ModalCloseButton>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default function ScreenshotCarousel({ urls }: CarouselProps) {
  const theme = useTheme();
  const progress = useSharedValue(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  return (
    <View
      style={{
        height: IMAGE_HEIGHT,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.divider,
      }}
      testID="screenshot-carousel"
    >
      <Carousel
        data={urls}
        keyExtractor={(url) => url}
        style={styles.carousel}
        progress={progress}
        // Only take over clearly horizontal swipes so the details can still scroll vertically
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-10, 10]);
        }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setPreviewIndex(index)}
            style={styles.carousel}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Screenshot ${index + 1} of ${urls.length}`}
          >
            <Image source={{ uri: item }} style={styles.carousel} contentFit="cover" />
          </Pressable>
        )}
      />
      <Pagination
        count={urls.length}
        progress={progress}
        containerStyle={styles.pagination}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.colors.secondary,
        }}
        activeDotStyle={{ width: 20, height: 5, backgroundColor: theme.colors.primary }}
      />
      {previewIndex !== null && (
        <ScreenshotPreview
          urls={urls}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: {
    flex: 1,
  },
  pagination: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    alignItems: "center",
    gap: 10,
  },
});
