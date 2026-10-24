import { ReactNode, useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ANIMATION_DURATION = 300;
const BACKDROP_OPACITY = 0.5;

interface SlideUpModalProps {
  visible: boolean;
  onClose: () => void;
  // Called once the hide animation has finished
  onHidden?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// Modal whose content slides up from the bottom over a fading backdrop.
// Pressing the backdrop or the Android back button calls onClose.
export default function SlideUpModal({
  visible,
  onClose,
  onHidden,
  style,
  children,
}: SlideUpModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const margin = width * 0.05;
  // Keep the native modal mounted until the hide animation has finished
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) {
    setMounted(true);
  }
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!mounted) return;
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
        onHidden?.();
      }
    });
    return () => animation.stop();
  }, [visible, mounted, progress, onHidden]);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, BACKDROP_OPACITY],
            }),
          },
        ]}
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Close"
        testID="modal-backdrop"
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            // Keep clear of the notch / Dynamic Island and the home indicator
            marginTop: Math.max(margin, insets.top),
            marginBottom: Math.max(margin, insets.bottom),
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "black",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
});
