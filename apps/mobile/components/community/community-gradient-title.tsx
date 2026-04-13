import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  View,
} from "react-native";
import { useTheme } from "../../lib/app-preferences";
import { useReducedMotionPreference } from "../../lib/use-reduced-motion-preference";

type CommunityGradientTitleProps = {
  text: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const LIGHT_STOPS = ["#ffffff", "#67e8f9", "#a78bfa", "#ffffff"] as const;
const DARK_STOPS = ["#f8fafc", "#93c5fd", "#c4b5fd", "#f8fafc"] as const;
const TITLE_ANIMATION_DURATION_MS = 4000;

function getColorStop(stops: readonly string[], index: number): string {
  return stops[((index % stops.length) + stops.length) % stops.length];
}

export function CommunityGradientTitle({
  text,
  containerStyle,
  textStyle,
}: CommunityGradientTitleProps) {
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotionPreference();
  const progress = useRef(new Animated.Value(0)).current;

  const gradientStops = useMemo(
    () => (resolvedTheme === "dark" ? DARK_STOPS : LIGHT_STOPS),
    [resolvedTheme]
  );
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);

    if (prefersReducedMotion) {
      return;
    }

    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: TITLE_ANIMATION_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [prefersReducedMotion, progress]);

  return (
    <View style={[styles.row, containerStyle]} accessibilityRole="header" accessible accessibilityLabel={text}>
      {characters.map((char, index) => {
        const color = prefersReducedMotion
          ? getColorStop(gradientStops, index)
          : progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [
                getColorStop(gradientStops, index),
                getColorStop(gradientStops, index + 1),
                getColorStop(gradientStops, index + 2),
              ],
            });

        return (
          <Animated.Text
            key={`${char}-${index}`}
            style={[styles.glyph, textStyle, { color }]}
            accessible={false}
          >
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  glyph: {
    fontSize: 28,
    fontWeight: "800",
  },
});
