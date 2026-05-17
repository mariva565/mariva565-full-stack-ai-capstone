import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import type { GoogleAuthRequestConfig } from "expo-auth-session/providers/google";

export function getGoogleRedirectUri(): string | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }

  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_REDIRECT_URI ??
    AuthSession.makeRedirectUri({ path: "login" })
  );
}

export function getGoogleAuthRequestConfig(): Partial<GoogleAuthRequestConfig> {
  const redirectUri = getGoogleRedirectUri();

  return {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    ...(redirectUri ? { redirectUri } : {}),
  };
}
