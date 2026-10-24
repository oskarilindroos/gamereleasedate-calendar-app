import { useState } from "react";
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";

const IMAGE_HEIGHT = 400;

interface CarouselProps {
  urls: string[];
}

const pageIndex = (
  event: NativeSyntheticEvent<NativeScrollEvent>,
  pageWidth: number
) => Math.round(event.nativeEvent.contentOffset.x / pageWidth);

function Indicators({ count, activeIndex }: { count: number; activeIndex: number }) {
  const theme = useTheme();
  return (
    <View style={styles.indicators} pointerEvents="none">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            index === activeIndex ? styles.activeIndicator : styles.inactiveIndicator,
            {
              backgroundColor:
                index === activeIndex ? theme.colors.primary : theme.colors.secondary,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Full screen image viewer with a blurred copy of the current image as background
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
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} supportedOrientations={["portrait", "landscape"]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
        <Image
          source={{ uri: urls[index] }}
          style={StyleSheet.absoluteFill}
          blurRadius={100}
        />
        <FlatList
          data={urls}
          keyExtractor={(url) => url}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(event) => setIndex(pageIndex(event, width))}
          renderItem={({ item }) => (
            <View style={[styles.previewPage, { width }]}>
              <Image
                source={{ uri: item }}
                style={{ width, height: IMAGE_HEIGHT }}
                resizeMode="contain"
              />
            </View>
          )}
        />
        <Pressable
          onPress={onClose}
          hitSlop={20}
          style={[styles.closeButton, { top: insets.top + 5 }]}
          accessibilityRole="button"
          accessibilityLabel="Close preview"
        >
          <Ionicons name="close" size={34} color={theme.colors.primary} />
        </Pressable>
      </View>
    </Modal>
  );
}

export default function ScreenshotCarousel({ urls }: CarouselProps) {
  const theme = useTheme();
  // Measure the container: the carousel lives in a modal that's narrower than the screen
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(event.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={{
        height: IMAGE_HEIGHT,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.divider,
      }}
      testID="screenshot-carousel"
    >
      {width > 0 && (
        <FlatList
          data={urls}
          keyExtractor={(url) => url}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(event) => setActiveIndex(pageIndex(event, width))}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setPreviewIndex(index)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Screenshot ${index + 1} of ${urls.length}`}
            >
              <Image
                source={{ uri: item }}
                style={{ width, height: IMAGE_HEIGHT }}
                resizeMode="cover"
              />
            </Pressable>
          )}
        />
      )}
      <Indicators count={urls.length} activeIndex={activeIndex} />
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
  indicators: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  activeIndicator: {
    height: 5,
    width: 20,
    borderRadius: 100,
    margin: 5,
  },
  inactiveIndicator: {
    height: 10,
    width: 10,
    borderRadius: 100,
    margin: 5,
  },
  previewPage: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    left: 5,
  },
});
