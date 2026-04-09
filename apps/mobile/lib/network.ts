import { useNetInfo, type NetInfoState } from "@react-native-community/netinfo";

export function isOfflineState(
  state: Pick<NetInfoState, "isConnected" | "isInternetReachable">
): boolean {
  if (state.isConnected === false) {
    return true;
  }

  if (state.isInternetReachable === false) {
    return true;
  }

  return false;
}

export function useIsOffline(): boolean {
  const netInfo = useNetInfo();
  return isOfflineState(netInfo);
}
