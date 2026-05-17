import { useState } from "react";
import { Animated, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { GoogleSignInButton } from "../auth/GoogleSignInButton";
import { AuthBrandHero } from "../auth/auth-brand-hero";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { styles } from "./register-screen.styles";
import type { RegisterScreenViewModel } from "./use-register-screen";

type RegisterScreenProps = { viewModel: RegisterScreenViewModel };

function RegisterHeader() {
  return (
    <>
      <AuthBrandHero
        subtitle="Join StudyHub today"
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

function NameField({ viewModel }: RegisterScreenProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Name</Text>
      <TextInput
        style={[styles.input, viewModel.focusedField === "name" && styles.inputFocused]}
        placeholder="Your name"
        placeholderTextColor={COLORS.textMuted}
        value={viewModel.name}
        onChangeText={viewModel.setName}
        onFocus={() => viewModel.onFocusField("name")}
        onBlur={() => viewModel.onBlurField("name")}
        autoCapitalize="words"
        textContentType="name"
      />
      {viewModel.touched.name && viewModel.nameError ? (
        <Text style={styles.fieldErrorText}>{viewModel.nameError}</Text>
      ) : null}
    </View>
  );
}

function EmailField({ viewModel }: RegisterScreenProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={[styles.input, viewModel.focusedField === "email" && styles.inputFocused]}
        placeholder="your@email.com"
        placeholderTextColor={COLORS.textMuted}
        value={viewModel.email}
        onChangeText={viewModel.setEmail}
        onFocus={() => viewModel.onFocusField("email")}
        onBlur={() => viewModel.onBlurField("email")}
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

function PasswordField({ viewModel }: RegisterScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Password</Text>
      <View style={styles.passwordField}>
        <TextInput
          style={[
            styles.passwordInput,
            viewModel.focusedField === "password" && styles.inputFocused,
          ]}
          placeholder="Min. 6 characters"
          placeholderTextColor={COLORS.textMuted}
          value={viewModel.password}
          onChangeText={viewModel.setPassword}
          onFocus={() => viewModel.onFocusField("password")}
          onBlur={() => viewModel.onBlurField("password")}
          secureTextEntry={!passwordVisible}
          textContentType="newPassword"
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

function CreateAccountButton({ viewModel }: RegisterScreenProps) {
  return (
    <TouchableOpacity
      style={[styles.button, viewModel.loading && styles.buttonDisabled]}
      onPress={viewModel.submitRegister}
      disabled={viewModel.loading}
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
          {viewModel.loading ? "Creating account..." : "Create Account"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function RegisterFooter({ viewModel }: RegisterScreenProps) {
  return (
    <TouchableOpacity
      onPress={viewModel.goToLogin}
      style={styles.switchLink}
      accessibilityRole="button"
      accessibilityLabel="Go to sign in screen"
    >
      <Text style={styles.switchText}>
        Already have an account? <Text style={styles.switchBold}>Sign In</Text>
      </Text>
    </TouchableOpacity>
  );
}

function RegisterCard({ viewModel }: RegisterScreenProps) {
  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: viewModel.fadeAnim, transform: [{ translateY: viewModel.slideAnim }] },
      ]}
    >
      <RegisterHeader />
      <ErrorBanner error={viewModel.error} />
      <NameField viewModel={viewModel} />
      <EmailField viewModel={viewModel} />
      <PasswordField viewModel={viewModel} />
      <CreateAccountButton viewModel={viewModel} />
      <GoogleSignInButton
        onPress={viewModel.submitGoogle}
        loading={viewModel.loading}
        disabled={!viewModel.googleReady}
      />
      <RegisterFooter viewModel={viewModel} />
    </Animated.View>
  );
}

export function RegisterScreen({ viewModel }: RegisterScreenProps) {
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
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <RegisterCard viewModel={viewModel} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
