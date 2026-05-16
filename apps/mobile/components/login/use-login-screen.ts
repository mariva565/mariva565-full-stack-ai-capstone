import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import { useAuth } from "../../lib/auth-context";
import { ApiError } from "../../lib/api";
import { getGoogleRedirectUri } from "../../lib/google-auth";
import { validateEmail, validateRequired } from "../../lib/validation";

WebBrowser.maybeCompleteAuthSession();

type TouchedState = { email: boolean; password: boolean };

type LoginFormController = {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  emailFocused: boolean;
  passwordFocused: boolean;
  touched: TouchedState;
  setLoading: (value: boolean) => void;
  setError: (value: string) => void;
  setTouched: (value: TouchedState) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onEmailFocus: () => void;
  onPasswordFocus: () => void;
  onEmailBlur: () => void;
  onPasswordBlur: () => void;
};

export type LoginScreenViewModel = {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  emailFocused: boolean;
  passwordFocused: boolean;
  emailError: string | null;
  passwordError: string | null;
  touched: TouchedState;
  googleReady: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onEmailFocus: () => void;
  onPasswordFocus: () => void;
  onEmailBlur: () => void;
  onPasswordBlur: () => void;
  submitLogin: () => void;
  submitGoogle: () => void;
  goToRegister: () => void;
};

function useCardIntroAnimation() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, [fadeAnim, slideAnim]);

  return { fadeAnim, slideAnim };
}

function useLoginFormState(): LoginFormController {
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [touched, setTouchedState] = useState<TouchedState>({ email: false, password: false });

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setError("");
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    setError("");
  }, []);

  const onEmailBlur = useCallback(() => {
    setEmailFocused(false);
    setTouchedState((current) => ({ ...current, email: true }));
  }, []);

  const onPasswordBlur = useCallback(() => {
    setPasswordFocused(false);
    setTouchedState((current) => ({ ...current, password: true }));
  }, []);

  return {
    email,
    password,
    loading,
    error,
    emailFocused,
    passwordFocused,
    touched,
    setLoading,
    setError,
    setTouched: setTouchedState,
    setEmail,
    setPassword,
    onEmailFocus: () => setEmailFocused(true),
    onPasswordFocus: () => setPasswordFocused(true),
    onEmailBlur,
    onPasswordBlur,
  };
}

function useGoogleLogin(
  loginWithGoogle: ReturnType<typeof useAuth>["loginWithGoogle"],
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
) {
  const redirectUri = getGoogleRedirectUri();
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  const handleGoogleLogin = useCallback(
    async (token: string) => {
      setLoading(true);
      setError("");
      try {
        await loginWithGoogle(token, "access_token");
      } catch (error) {
        setError(error instanceof ApiError ? error.message : "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, setError, setLoading]
  );

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        void handleGoogleLogin(accessToken);
      }
    }
  }, [handleGoogleLogin, response]);

  return { googleReady: Boolean(request), promptAsync };
}

function useLoginSubmission(
  login: ReturnType<typeof useAuth>["login"],
  form: LoginFormController,
  emailError: string | null,
  passwordError: string | null
) {
  return useCallback(() => {
    form.setTouched({ email: true, password: true });
    if (emailError || passwordError) {
      return;
    }
    form.setError("");
    form.setLoading(true);
    void login(form.email.trim(), form.password)
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : "Connection failed. Is the server running?";
        form.setError(message);
      })
      .finally(() => form.setLoading(false));
  }, [emailError, form, login, passwordError]);
}

export function useLoginScreen(): LoginScreenViewModel {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const form = useLoginFormState();

  const emailError = useMemo(() => validateEmail(form.email), [form.email]);
  const passwordError = useMemo(
    () => validateRequired(form.password, "Password"),
    [form.password]
  );
  const { fadeAnim, slideAnim } = useCardIntroAnimation();
  const { googleReady, promptAsync } = useGoogleLogin(
    loginWithGoogle,
    form.setLoading,
    form.setError
  );
  const submitLogin = useLoginSubmission(login, form, emailError, passwordError);

  const submitGoogle = useCallback(() => {
    void promptAsync();
  }, [promptAsync]);

  const goToRegister = useCallback(() => {
    router.replace("/register");
  }, [router]);

  return {
    email: form.email,
    password: form.password,
    loading: form.loading,
    error: form.error,
    emailFocused: form.emailFocused,
    passwordFocused: form.passwordFocused,
    emailError,
    passwordError,
    touched: form.touched,
    googleReady,
    fadeAnim,
    slideAnim,
    setEmail: form.setEmail,
    setPassword: form.setPassword,
    onEmailFocus: form.onEmailFocus,
    onPasswordFocus: form.onPasswordFocus,
    onEmailBlur: form.onEmailBlur,
    onPasswordBlur: form.onPasswordBlur,
    submitLogin,
    submitGoogle,
    goToRegister,
  };
}
