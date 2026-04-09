import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { COLORS } from "../../lib/colors";

type SkeletonBlockProps = {
  pulse: Animated.Value;
  style?: StyleProp<ViewStyle>;
};

export function useSkeletonPulse(): Animated.Value {
  const pulse = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.78,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.42,
          duration: 760,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  return pulse;
}

export function SkeletonBlock({ pulse, style }: SkeletonBlockProps) {
  return <Animated.View style={[styles.block, { opacity: pulse }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 10,
    backgroundColor: COLORS.surfaceMuted,
  },
});
