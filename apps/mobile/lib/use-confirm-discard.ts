import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";

type Options = {
  enabled: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function useConfirmDiscard({
  enabled,
  title = "Discard changes?",
  message = "You have unsaved changes. If you leave now, your edits will be lost.",
  confirmLabel = "Discard",
  cancelLabel = "Keep editing",
}: Options) {
  const navigation = useNavigation();
  const allowNextLeaveRef = useRef(false);

  const allowNextLeave = useCallback(() => {
    allowNextLeaveRef.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!enabled) {
        return;
      }

      if (allowNextLeaveRef.current) {
        allowNextLeaveRef.current = false;
        return;
      }

      event.preventDefault();
      Alert.alert(title, message, [
        { text: cancelLabel, style: "cancel" },
        {
          text: confirmLabel,
          style: "destructive",
          onPress: () => {
            allowNextLeaveRef.current = true;
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });

    return unsubscribe;
  }, [cancelLabel, confirmLabel, enabled, message, navigation, title]);

  return { allowNextLeave };
}
