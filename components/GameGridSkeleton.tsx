import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import * as Styled from "./styled/styles";
import { GAME_CARD_MARGIN, GAME_CARD_WIDTH } from "../utils/layout";

const PULSE_DURATION = 800;
const ROWS = 4;

interface GameGridSkeletonProps {
  numColumns: number;
}

// Placeholder cards shown in the game grid while the first page loads
export default function GameGridSkeleton({ numColumns }: GameGridSkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: PULSE_DURATION, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: PULSE_DURATION, useNativeDriver: true }),
      ])
    );
    let cancelled = false;
    // Stay still for people who have reduced motion turned on
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (!cancelled && !reduceMotion) pulse.start();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      pulse.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      testID="loading-indicator"
      accessible
      accessibilityLabel="Loading games"
      style={{ flexDirection: "row", flexWrap: "wrap", width: numColumns * (GAME_CARD_WIDTH + GAME_CARD_MARGIN), opacity }}
    >
      {Array.from({ length: numColumns * ROWS }, (_, i) => (
        <Styled.GameCardSkeleton key={i}>
          <Styled.SkeletonBlock style={{ height: 200 }} />
          <Styled.SkeletonLine style={{ width: "85%" }} />
          <Styled.SkeletonLine style={{ width: "50%" }} />
        </Styled.GameCardSkeleton>
      ))}
    </Animated.View>
  );
}
