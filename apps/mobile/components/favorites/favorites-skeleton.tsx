import { StyleSheet, View } from "react-native";

import { COLORS } from "../../lib/colors";
import { SkeletonBlock, useSkeletonPulse } from "../skeleton/skeleton-block";

const FAVORITE_CARD_PLACEHOLDERS = [1, 2, 3];

export function FavoritesSkeleton() {
  const pulse = useSkeletonPulse();

  return (
    <View style={styles.container} importantForAccessibility="no-hide-descendants">
      <View style={styles.hero}>
        <SkeletonBlock pulse={pulse} style={styles.heroLabel} />
        <SkeletonBlock pulse={pulse} style={styles.heroTitle} />
        <SkeletonBlock pulse={pulse} style={styles.heroMeta} />
      </View>

      <View style={styles.list}>
        {FAVORITE_CARD_PLACEHOLDERS.map((item) => (
          <View key={item} style={styles.card}>
            <SkeletonBlock pulse={pulse} style={styles.title} />
            <SkeletonBlock pulse={pulse} style={styles.meta} />

            <View style={styles.tagsRow}>
              <SkeletonBlock pulse={pulse} style={styles.tag} />
              <SkeletonBlock pulse={pulse} style={styles.tag} />
            </View>

            <View style={styles.actions}>
              <SkeletonBlock pulse={pulse} style={styles.actionBtn} />
              <SkeletonBlock pulse={pulse} style={styles.actionBtn} />
              <SkeletonBlock pulse={pulse} style={styles.unpinBtn} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  hero: {
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: COLORS.brandDeep,
  },
  heroLabel: {
    width: 84,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  heroTitle: {
    marginTop: 8,
    width: 142,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  heroMeta: {
    marginTop: 10,
    width: 166,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 14,
  },
  title: {
    width: "76%",
    height: 17,
  },
  meta: {
    marginTop: 10,
    width: "62%",
    height: 12,
  },
  tagsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 6,
  },
  tag: {
    width: 56,
    height: 22,
    borderRadius: 6,
  },
  actions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 58,
    height: 30,
    borderRadius: 9,
  },
  unpinBtn: {
    marginLeft: "auto",
    width: 74,
    height: 30,
    borderRadius: 9,
  },
});
