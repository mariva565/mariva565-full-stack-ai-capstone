import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotionPreference(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setPrefersReducedMotion(enabled);
        }
      })
      .catch(() => {
        // Keep default false when platform APIs fail.
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setPrefersReducedMotion
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return prefersReducedMotion;
}
