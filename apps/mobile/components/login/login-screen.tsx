import { useState } from "react";
import { Animated, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { GoogleSignInButton } from "../auth/GoogleSignInButton";
import { AuthBrandHero } from "../auth/auth-brand-hero";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { styles } from "./login-screen.styles";
import type { LoginScreenViewModel } from "./use-login-screen";

type LoginScreenProps = { viewModel: LoginScreenViewModel };

function AuthHeader() {
  return (
    <>
      <AuthBrandHero
        subtitle="Sign in to continue"
        description="Your personal learning hub for courses, modules, and study materials in one place."
      />
    </>
  );
}

function ErrorBanner({ error }: { error: string }) {
  if (!error) {
    return null;
  }
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

function EmailField({ viewModel }: LoginScreenProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={[styles.input, viewModel.emailFocused && styles.inputFocused]}
        placeholder="your@email.com"
        placeholderTextColor={COLORS.textMuted}
        value={viewModel.email}
        onChangeText={viewModel.setEmail}
        onFocus={viewModel.onEmailFocus}
        onBlur={viewModel.onEmailBlur}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      {viewModel.touched.email && viewModel.emailError ? (
        <Text style={styles.fieldErrorText}>{viewModel.emailError}</Text>
      ) : null}
    </View>
  );
}

function PasswordField({ viewModel }: LoginScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Password</Text>
      <View style={[styles.passwordField, viewModel.passwordFocused && styles.inputFocused]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="********"
          placeholderTextColor={COLORS.textMuted}
          value={viewModel.password}
          onChangeText={viewModel.setPassword}
          onFocus={viewModel.onPasswordFocus}
          onBlur={viewModel.onPasswordBlur}
          secureTextEntry={!passwordVisible}
          textContentType="password"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setPasswordVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
      {viewModel.touched.password && viewModel.passwordError ? (
        <Text style={styles.fieldErrorText}>{viewModel.passwordError}</Text>
      ) : null}
    </View>
  );
}

function SignInButton({ viewModel }: LoginScreenProps) {
  return (
    <TouchableOpacity
      style={[styles.button, viewModel.loading && styles.buttonDisabled]}
      onPress={viewModel.submitLogin}
      disabled={viewModel.loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Sign in"
    >
      <LinearGradient
        colors={GRADIENTS.primaryAction}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonText}>{viewModel.loading ? "Signing in..." : "Sign In"}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function LoginFooter({ viewModel }: LoginScreenProps) {
  return (
    <>
      <TouchableOpacity
        onPress={viewModel.goToRegister}
        style={styles.switchLink}
        accessibilityRole="button"
        accessibilityLabel="Go to register screen"
      >
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.switchBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </>
  );
}

function LoginCard({ viewModel }: LoginScreenProps) {
  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: viewModel.fadeAnim, transform: [{ translateY: viewModel.slideAnim }] },
      ]}
    >
      <AuthHeader />
      <ErrorBanner error={viewModel.error} />
      <EmailField viewModel={viewModel} />
      <PasswordField viewModel={viewModel} />
      <SignInButton viewModel={viewModel} />
      <GoogleSignInButton
        onPress={viewModel.submitGoogle}
        loading={viewModel.loading}
        disabled={!viewModel.googleReady}
      />
      <LoginFooter viewModel={viewModel} />
    </Animated.View>
  );
}

export function LoginScreen({ viewModel }: LoginScreenProps) {
  return (
    <LinearGradient
      colors={GRADIENTS.authHero}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <LoginCard viewModel={viewModel} />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
