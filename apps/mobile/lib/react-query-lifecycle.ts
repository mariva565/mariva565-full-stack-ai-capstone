import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus, Platform } from "react-native";

function isOnline(state: NetInfoState): boolean {
  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  return true;
}

export function configureReactQueryLifecycle(): void {
  if (Platform.OS === "web") {
    return;
  }

  focusManager.setEventListener((setFocused) => {
    const onChange = (status: AppStateStatus) => {
      setFocused(status === "active");
    };

    const appStateSubscription = AppState.addEventListener("change", onChange);
    return () => {
      appStateSubscription.remove();
    };
  });

  onlineManager.setEventListener((setOnline) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(isOnline(state));
    });

    void NetInfo.fetch().then((state) => {
      setOnline(isOnline(state));
    });

    return unsubscribe;
  });
}
