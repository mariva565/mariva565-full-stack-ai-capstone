import { Text as RNText, TouchableOpacity, View } from "react-native";
import type { SharedMaterial } from "../../../web/components/dashboard/types";
import { type FavoritesStyles } from "./favorites.styles";

type SharedMaterialCardProps = {
  item: SharedMaterial;
  onOpenMaterial: () => void;
  styles: FavoritesStyles;
};

export function SharedMaterialCard({
  item,
  onOpenMaterial,
  styles,
}: SharedMaterialCardProps) {
  const sharedAtFormatted = new Date(item.sharedAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={onOpenMaterial}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Open shared material ${item.title}`}
        accessibilityHint="Opens the material details screen"
      >
        <RNText style={styles.cardTitle} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {item.title}
        </RNText>
        <RNText style={styles.cardMeta} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          Shared by {item.sharedBy.name || item.sharedBy.email || "someone"} {"\u00B7"} {sharedAtFormatted}
        </RNText>
        <RNText style={styles.cardMeta} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {item.context}
        </RNText>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onOpenMaterial}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open material ${item.title}`}
          accessibilityHint="Navigates to the shared material workspace"
        >
          <RNText style={styles.linkBtnText} maxFontSizeMultiplier={1.2}>
            Open material
          </RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
