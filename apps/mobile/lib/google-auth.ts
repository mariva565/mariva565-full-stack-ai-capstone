import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

const NATIVE_EXPO_REDIRECT_URI = "https://auth.expo.io/@mariva/studyhub-v2";

export function getGoogleRedirectUri(): string {
  if (Platform.OS === "web") {
    return (
      process.env.EXPO_PUBLIC_GOOGLE_WEB_REDIRECT_URI ??
      AuthSession.makeRedirectUri({ path: "login" })
    );
  }

  return NATIVE_EXPO_REDIRECT_URI;
}
