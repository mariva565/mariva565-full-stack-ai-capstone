import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import { useAuth } from "../../lib/auth-context";
import { ApiError } from "../../lib/api";
import { validateEmail, validateMinLength, validateRequired } from "../../lib/validation";

WebBrowser.maybeCompleteAuthSession();

type FocusedField = "name" | "email" | "password" | null;
type TouchedState = { name: boolean; email: boolean; password: boolean };

type RegisterFormController = {
  name: string;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  focusedField: FocusedField;
  touched: TouchedState;
  setLoading: (value: boolean) => void;
  setError: (value: string) => void;
  setTouched: (value: TouchedState) => void;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onFocusField: (field: FocusedField) => void;
  onBlurField: (field: Exclude<FocusedField, null>) => void;
};

export type RegisterScreenViewModel = {
  name: string;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  focusedField: FocusedField;
  touched: TouchedState;
  nameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  googleReady: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onFocusField: (field: FocusedField) => void;
  onBlurField: (field: Exclude<FocusedField, null>) => void;
  submitRegister: () => void;
  submitGoogle: () => void;
  goToLogin: () => void;
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

function useRegisterFormState(): RegisterFormController {
  const [name, setNameState] = useState("");
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [touched, setTouchedState] = useState<TouchedState>({
    name: false,
    email: false,
    password: false,
  });

  const setName = useCallback((value: string) => {
    setNameState(value);
    setError("");
  }, []);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setError("");
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    setError("");
  }, []);

  const onFocusField = useCallback((field: FocusedField) => {
    setFocusedField(field);
  }, []);

  const onBlurField = useCallback((field: Exclude<FocusedField, null>) => {
    setFocusedField(null);
    setTouchedState((current) => ({ ...current, [field]: true }));
  }, []);

  return {
    name,
    email,
    password,
    loading,
    error,
    focusedField,
    touched,
    setLoading,
    setError,
    setTouched: setTouchedState,
    setName,
    setEmail,
    setPassword,
    onFocusField,
    onBlurField,
  };
}

function useGoogleRegister(
  loginWithGoogle: ReturnType<typeof useAuth>["loginWithGoogle"],
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
) {
  const redirectUri = "https://auth.expo.io/@mariva/studyhub-v2";
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

function useRegisterSubmission(
  register: ReturnType<typeof useAuth>["register"],
  form: RegisterFormController,
  nameError: string | null,
  emailError: string | null,
  passwordError: string | null
) {
  return useCallback(() => {
    form.setTouched({ name: true, email: true, password: true });
    if (nameError || emailError || passwordError) {
      return;
    }
    form.setError("");
    form.setLoading(true);
    void register(form.email.trim(), form.name.trim(), form.password)
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : "Connection failed. Is the server running?";
        form.setError(message);
      })
      .finally(() => form.setLoading(false));
  }, [emailError, form, nameError, passwordError, register]);
}

export function useRegisterScreen(): RegisterScreenViewModel {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const form = useRegisterFormState();

  const nameError = useMemo(() => validateRequired(form.name, "Name"), [form.name]);
  const emailError = useMemo(() => validateEmail(form.email), [form.email]);
  const passwordError = useMemo(
    () => validateMinLength(form.password, 6, "Password"),
    [form.password]
  );
  const { fadeAnim, slideAnim } = useCardIntroAnimation();
  const { googleReady, promptAsync } = useGoogleRegister(
    loginWithGoogle,
    form.setLoading,
    form.setError
  );
  const submitRegister = useRegisterSubmission(
    register,
    form,
    nameError,
    emailError,
    passwordError
  );

  const submitGoogle = useCallback(() => {
    void promptAsync();
  }, [promptAsync]);

  const goToLogin = useCallback(() => {
    router.replace("/login");
  }, [router]);

  return {
    name: form.name,
    email: form.email,
    password: form.password,
    loading: form.loading,
    error: form.error,
    focusedField: form.focusedField,
    touched: form.touched,
    nameError,
    emailError,
    passwordError,
    googleReady,
    fadeAnim,
    slideAnim,
    setName: form.setName,
    setEmail: form.setEmail,
    setPassword: form.setPassword,
    onFocusField: form.onFocusField,
    onBlurField: form.onBlurField,
    submitRegister,
    submitGoogle,
    goToLogin,
  };
}
