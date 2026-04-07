import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleSignInButtonProps) {
  const shineAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const startShine = () => {
      shineAnim.setValue(-1);
      Animated.timing(shineAnim, {
        toValue: 2,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Loop after a delay
        setTimeout(startShine, 1000);
      });
    };

    startShine();
  }, [shineAnim]);

  const translateX = shineAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-150, 400],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.button, (disabled || loading) && styles.disabled]}
    >
      <View style={styles.glassBackground}>
        {/* Animated Shine Effect */}
        <Animated.View
          style={[
            styles.shineContainer,
            { transform: [{ translateX }, { rotate: "25deg" }] },
          ]}
        >
          <LinearGradient
            colors={["transparent", "rgba(255, 255, 255, 0.4)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shineGradient}
          />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            {loading ? (
              <ActivityIndicator color="#4d33c4" size="small" />
            ) : (
              <AntDesign name="google" size={18} color="#4d33c4" />
            )}
          </View>
          <Text style={styles.text}>
            {loading ? "Connecting..." : "Continue with Google"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 58,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabled: {
    opacity: 0.6,
  },
  glassBackground: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4d33c4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e1d7a",
    letterSpacing: -0.3,
  },
  shineContainer: {
    position: "absolute",
    top: -50,
    bottom: -50,
    width: 100,
    opacity: 0.6,
  },
  shineGradient: {
    flex: 1,
  },
});
