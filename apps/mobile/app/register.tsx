import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../lib/auth-context";
import { ApiError } from "../lib/api";
import { COLORS, GRADIENTS } from "../lib/colors";
import { validateEmail, validateMinLength, validateRequired } from "../lib/validation";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const nameError = validateRequired(name, "Name");
  const emailError = validateEmail(email);
  const passwordError = validateMinLength(password, 6, "Password");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Google Auth Hook
  const redirectUri = "https://auth.expo.io/@mariva/studyhub-v2";
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  async function handleGoogleLogin(token: string) {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(token, "access_token");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function handleRegister() {
    setTouched({ name: true, email: true, password: true });
    if (nameError || emailError || passwordError) {
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register(email.trim(), name.trim(), password);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "Connection failed. Is the server running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={GRADIENTS.heroStrong}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>📚</Text>
              </View>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join StudyHub today</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={[styles.input, focusedField === "name" && styles.inputFocused]}
                placeholder="Your name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (error) {
                    setError("");
                  }
                }}
                onFocus={() => setFocusedField("name")}
                onBlur={() => {
                  setFocusedField(null);
                  setTouched((current) => ({ ...current, name: true }));
                }}
                autoCapitalize="words"
                textContentType="name"
              />
              {touched.name && nameError ? (
                <Text style={styles.fieldErrorText}>{nameError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, focusedField === "email" && styles.inputFocused]}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) {
                    setError("");
                  }
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => {
                  setFocusedField(null);
                  setTouched((current) => ({ ...current, email: true }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              {touched.email && emailError ? (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[styles.input, focusedField === "password" && styles.inputFocused]}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) {
                    setError("");
                  }
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => {
                  setFocusedField(null);
                  setTouched((current) => ({ ...current, password: true }));
                }}
                secureTextEntry
                textContentType="newPassword"
              />
              {touched.password && passwordError ? (
                <Text style={styles.fieldErrorText}>{passwordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <LinearGradient
                colors={GRADIENTS.primaryAction}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <GoogleSignInButton
              onPress={() => promptAsync()}
              loading={loading}
              disabled={!request}
            />

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              style={styles.switchLink}
              accessibilityRole="button"
              accessibilityLabel="Go to sign in screen"
            >
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.brandDeep,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldErrorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: COLORS.borderMuted,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.brandPrimary,
    backgroundColor: "#faf9ff",
    shadowColor: COLORS.brandPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.textOnBrand,
    fontSize: 16,
    fontWeight: "700",
  },
  switchLink: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  switchBold: {
    color: COLORS.brandPrimary,
    fontWeight: "700",
  },
});
