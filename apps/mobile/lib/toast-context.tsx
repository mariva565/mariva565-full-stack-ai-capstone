import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "./colors";
import { triggerHaptic, type HapticIntent } from "./haptics";

export type ToastType = "success" | "error" | "info";
export type ToastHaptic = "default" | "destructive" | "none";
export type ToastOptions = {
  haptic?: ToastHaptic;
};

type ToastState = {
  message: string;
  type: ToastType;
  key: number;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyRef = useRef(0);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [translateY, opacity]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", options?: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      keyRef.current += 1;
      setToast({ message, type, key: keyRef.current });

      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(dismiss, TOAST_DURATION);
      void triggerToastHaptic(type, options?.haptic ?? "default");
    },
    [translateY, opacity, dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <Animated.View
          key={toast.key}
          style={[
            styles.toastContainer,
            { transform: [{ translateY }], opacity },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={[styles.toast, typeStyles[toast.type]]}
            onPress={dismiss}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <Text style={styles.toastIcon}>{TYPE_ICONS[toast.type]}</Text>
            <Text style={styles.toastText} numberOfLines={2}>
              {toast.message}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const TYPE_ICONS: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2717",
  info: "\u2139",
};

function resolveHapticIntent(type: ToastType, haptic: ToastHaptic): HapticIntent | null {
  if (haptic === "none") {
    return null;
  }

  if (haptic === "destructive") {
    return "destructive";
  }

  if (type === "error") {
    return "error";
  }
  if (type === "info") {
    return "selection";
  }

  return "success";
}

async function triggerToastHaptic(type: ToastType, haptic: ToastHaptic): Promise<void> {
  const intent = resolveHapticIntent(type, haptic);
  if (!intent) {
    return;
  }

  await triggerHaptic(intent);
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 54,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    width: "100%",
  },
  toastIcon: {
    fontSize: 16,
    fontWeight: "800",
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});

const typeStyles = StyleSheet.create({
  success: {
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  error: {
    backgroundColor: COLORS.dangerSoftAlt,
    borderWidth: 1,
    borderColor: COLORS.dangerBorderSoft,
  },
  info: {
    backgroundColor: COLORS.infoSoft,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
});
