import { type MutableRefObject, useCallback, useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "expo-router";
import { useConfirmDialog } from "./confirm-dialog-context";

type Options = {
  enabled: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type NavigationAction = unknown;

type NavigationLike = {
  addListener: (
    event: "beforeRemove",
    listener: (event: BeforeRemoveEvent) => void
  ) => () => void;
  dispatch: (action: never) => void;
};

type BeforeRemoveEvent = {
  preventDefault: () => void;
  data: {
    action: NavigationAction;
  };
};

type HandleBeforeRemoveArgs = {
  event: BeforeRemoveEvent;
  enabled: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  allowNextLeaveRef: MutableRefObject<boolean>;
  continueNavigation: (action: NavigationAction) => void;
  openWebConfirm: (action: NavigationAction) => void;
};

function handleBeforeRemove({
  event,
  enabled,
  title,
  message,
  confirmLabel,
  cancelLabel,
  allowNextLeaveRef,
  continueNavigation,
  openWebConfirm,
}: HandleBeforeRemoveArgs): void {
  if (!enabled) {
    return;
  }

  if (allowNextLeaveRef.current) {
    allowNextLeaveRef.current = false;
    return;
  }

  event.preventDefault();
  if (Platform.OS === "web") {
    openWebConfirm(event.data.action);
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    {
      text: confirmLabel,
      style: "destructive",
      onPress: () => continueNavigation(event.data.action),
    },
  ]);
}

type UseDiscardGuardArgs = {
  enabled: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  navigation: NavigationLike;
  allowNextLeaveRef: MutableRefObject<boolean>;
  continueNavigation: (action: NavigationAction) => void;
  openWebConfirm: (action: NavigationAction) => void;
};

function useDiscardGuard({
  enabled,
  title,
  message,
  confirmLabel,
  cancelLabel,
  navigation,
  allowNextLeaveRef,
  continueNavigation,
  openWebConfirm,
}: UseDiscardGuardArgs): void {
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      handleBeforeRemove({
        event,
        enabled,
        title,
        message,
        confirmLabel,
        cancelLabel,
        allowNextLeaveRef,
        continueNavigation,
        openWebConfirm,
      });
    });

    return unsubscribe;
  }, [
    allowNextLeaveRef,
    cancelLabel,
    confirmLabel,
    continueNavigation,
    enabled,
    message,
    navigation,
    openWebConfirm,
    title,
  ]);
}

export function useConfirmDiscard({
  enabled,
  title = "Discard changes?",
  message = "You have unsaved changes. If you leave now, your edits will be lost.",
  confirmLabel = "Discard",
  cancelLabel = "Keep editing",
}: Options) {
  const navigation = useNavigation() as NavigationLike;
  const { confirm } = useConfirmDialog();
  const allowNextLeaveRef = useRef(false);

  const allowNextLeave = useCallback(() => {
    allowNextLeaveRef.current = true;
  }, []);

  const continueNavigation = useCallback(
    (action: NavigationAction) => {
      allowNextLeaveRef.current = true;
      navigation.dispatch(action as never);
    },
    [navigation]
  );

  const openWebConfirm = useCallback(
    (action: NavigationAction) => {
      void confirm({
        title,
        message,
        confirmLabel,
        cancelLabel,
        destructive: true,
      }).then((accepted) => {
        if (accepted) {
          continueNavigation(action);
        }
      });
    },
    [cancelLabel, confirm, confirmLabel, continueNavigation, message, title]
  );

  useDiscardGuard({
    enabled,
    title,
    message,
    confirmLabel,
    cancelLabel,
    navigation,
    allowNextLeaveRef,
    continueNavigation,
    openWebConfirm,
  });

  return { allowNextLeave };
}
