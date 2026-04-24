import { Text as RNText, TouchableOpacity, View } from "react-native";

import type { FavoritesStyles } from "./favorites.styles";

export type FavoritesTabKey = "pinned" | "shared" | "sharedByMe";

type FavoritesTabSwitcherProps = {
  activeTab: FavoritesTabKey;
  onChange: (tab: FavoritesTabKey) => void;
  styles: FavoritesStyles;
};

const FAVORITES_TABS: { key: FavoritesTabKey; label: string }[] = [
  { key: "pinned", label: "Pinned" },
  { key: "shared", label: "Shared with me" },
  { key: "sharedByMe", label: "Shared by me" },
];

export function FavoritesTabSwitcher({
  activeTab,
  onChange,
  styles,
}: FavoritesTabSwitcherProps) {
  return (
    <View style={styles.tabsWrap}>
      {FAVORITES_TABS.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.8}
            accessibilityRole="tab"
          >
            <RNText style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
              {tab.label}
            </RNText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
