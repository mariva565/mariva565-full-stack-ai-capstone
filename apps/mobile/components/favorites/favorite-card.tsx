import { Text as RNText, TouchableOpacity, View } from "react-native";

import { splitTags } from "../../lib/material-utils";
import type { FavoriteItem } from "../../lib/studyhub-types";
import type { FavoritesStyles } from "./favorites.styles";

type FavoriteCardProps = {
  item: FavoriteItem;
  busy: boolean;
  onOpenMaterial: () => void;
  onOpenModule: () => void;
  onOpenCourse: () => void;
  onUnpin: () => void;
  styles: FavoritesStyles;
};

export function FavoriteCard({
  item,
  busy,
  onOpenMaterial,
  onOpenModule,
  onOpenCourse,
  onUnpin,
  styles,
}: FavoriteCardProps) {
  const tags = splitTags(item.tags);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={onOpenMaterial}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Open favorite material ${item.materialTitle}`}
        accessibilityHint="Opens the material details screen"
      >
        <RNText style={styles.cardTitle} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {item.materialTitle}
        </RNText>
        <RNText style={styles.cardMeta} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {item.courseTitle} {"\u00B7"} {item.moduleTitle}
        </RNText>
      </TouchableOpacity>

      {tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {tags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tag}>
              <RNText style={styles.tagText} maxFontSizeMultiplier={1.2}>
                {tag}
              </RNText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onOpenCourse}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open course ${item.courseTitle}`}
          accessibilityHint="Navigates to the related course"
        >
          <RNText style={styles.linkBtnText} maxFontSizeMultiplier={1.2}>
            Course
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onOpenModule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open module ${item.moduleTitle}`}
          accessibilityHint="Navigates to the related module workspace"
        >
          <RNText style={styles.linkBtnText} maxFontSizeMultiplier={1.2}>
            Module
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unpinBtn, busy && styles.unpinBtnDisabled]}
          onPress={onUnpin}
          activeOpacity={0.8}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.materialTitle} from favorites`}
          accessibilityHint="Unpins this material from quick access"
        >
          <RNText style={styles.unpinBtnText} maxFontSizeMultiplier={1.2}>
            {busy ? "Removing..." : "Unpin"}
          </RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
