import { Text as RNText, TouchableOpacity, View } from "react-native";
import type { SharedByMeItem } from "../../lib/share";
import type { FavoritesStyles } from "./favorites.styles";

type Props = {
  item: SharedByMeItem;
  onOpenMaterial: () => void;
  styles: FavoritesStyles;
};

export function SharedByMeCard({ item, onOpenMaterial, styles }: Props) {
  const recipient = item.sharedWith.name || item.sharedWith.email;
  const sharedAtFormatted = new Date(item.sharedAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={onOpenMaterial}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Open shared material ${item.materialTitle}`}
      >
        <RNText style={styles.cardTitle} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {item.materialTitle}
        </RNText>
        <RNText style={styles.cardMeta} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {item.context}
        </RNText>
        <RNText style={styles.cardMeta} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          Shared with {recipient} {"·"} {sharedAtFormatted}
        </RNText>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onOpenMaterial}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open material ${item.materialTitle}`}
        >
          <RNText style={styles.linkBtnText} maxFontSizeMultiplier={1.2}>
            Open material
          </RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
