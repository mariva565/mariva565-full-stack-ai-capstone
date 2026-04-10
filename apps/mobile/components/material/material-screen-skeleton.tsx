import { ScrollView, StyleSheet, View } from "react-native";

import { useThemedStyles } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";
import { SkeletonBlock, useSkeletonPulse } from "../skeleton/skeleton-block";

const TAG_PLACEHOLDERS = [1, 2, 3];

export function MaterialScreenSkeleton() {
  const pulse = useSkeletonPulse();
  const styles = useThemedStyles(makeMaterialScreenSkeletonStyles);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.hero}>
        <SkeletonBlock pulse={pulse} style={styles.badge} />
        <SkeletonBlock pulse={pulse} style={styles.title} />
        <SkeletonBlock pulse={pulse} style={styles.date} />
        <SkeletonBlock pulse={pulse} style={styles.pinButton} />
      </View>

      <View style={styles.contentCard}>
        <SkeletonBlock pulse={pulse} style={styles.contentLine} />
        <SkeletonBlock pulse={pulse} style={styles.contentLineWide} />
        <SkeletonBlock pulse={pulse} style={styles.contentLine} />
        <SkeletonBlock pulse={pulse} style={styles.contentLineShort} />
      </View>

      <View style={styles.linkCard}>
        <SkeletonBlock pulse={pulse} style={styles.linkLabel} />
        <SkeletonBlock pulse={pulse} style={styles.linkLine} />
        <SkeletonBlock pulse={pulse} style={styles.linkLineWide} />
      </View>

      <View style={styles.tagsCard}>
        <SkeletonBlock pulse={pulse} style={styles.tagsTitle} />
        <View style={styles.tagsRow}>
          {TAG_PLACEHOLDERS.map((item) => (
            <SkeletonBlock key={item} pulse={pulse} style={styles.tagChip} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function makeMaterialScreenSkeletonStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      paddingBottom: 32,
    },
    hero: {
      paddingTop: 20,
      paddingBottom: 24,
      paddingHorizontal: 20,
      backgroundColor: colors.brandDeep,
    },
    badge: {
      width: 96,
      height: 24,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.24)",
    },
    title: {
      marginTop: 12,
      width: "78%",
      height: 26,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.28)",
    },
    date: {
      marginTop: 10,
      width: 116,
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    pinButton: {
      marginTop: 14,
      width: 146,
      height: 34,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.24)",
    },
    contentCard: {
      backgroundColor: colors.surface,
      margin: 16,
      borderRadius: 14,
      padding: 20,
      gap: 10,
    },
    contentLine: {
      width: "82%",
      height: 13,
    },
    contentLineWide: {
      width: "95%",
      height: 13,
    },
    contentLineShort: {
      width: "68%",
      height: 13,
    },
    linkCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 14,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.linkSoft,
      gap: 8,
    },
    linkLabel: {
      width: 84,
      height: 14,
    },
    linkLine: {
      width: "86%",
      height: 12,
    },
    linkLineWide: {
      width: "66%",
      height: 12,
    },
    tagsCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 16,
    },
    tagsTitle: {
      width: 46,
      height: 13,
      marginBottom: 10,
    },
    tagsRow: {
      flexDirection: "row",
      gap: 8,
    },
    tagChip: {
      width: 62,
      height: 28,
      borderRadius: 8,
    },
  });
}
