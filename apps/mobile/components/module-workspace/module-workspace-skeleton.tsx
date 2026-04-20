import { ScrollView, StyleSheet, View } from "react-native";

import { useThemedStyles } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";
import { SkeletonBlock, useSkeletonPulse } from "../skeleton/skeleton-block";

const MATERIAL_PLACEHOLDERS = [1, 2, 3];
const FILTER_PLACEHOLDERS = [1, 2, 3];

export function ModuleWorkspaceSkeleton() {
  const pulse = useSkeletonPulse();
  const styles = useThemedStyles(makeModuleWorkspaceSkeletonStyles);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.hero}>
        <SkeletonBlock pulse={pulse} style={styles.coursePill} />
        <SkeletonBlock pulse={pulse} style={styles.heroTitle} />
        <SkeletonBlock pulse={pulse} style={styles.heroLine} />
        <SkeletonBlock pulse={pulse} style={styles.heroLineWide} />
        <SkeletonBlock pulse={pulse} style={styles.heroMeta} />

        <View style={styles.heroActions}>
          <SkeletonBlock pulse={pulse} style={styles.heroActionBtn} />
          <SkeletonBlock pulse={pulse} style={styles.heroActionBtn} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <SkeletonBlock pulse={pulse} style={styles.sectionTitle} />
          <SkeletonBlock pulse={pulse} style={styles.sectionSubtitle} />
        </View>
        <SkeletonBlock pulse={pulse} style={styles.addBtn} />
      </View>

      <View style={styles.searchBar} />
      <View style={styles.filterRow}>
        {FILTER_PLACEHOLDERS.map((item) => (
          <SkeletonBlock key={item} pulse={pulse} style={styles.filterChip} />
        ))}
      </View>

      <View style={styles.materialsList}>
        {MATERIAL_PLACEHOLDERS.map((item) => (
          <View key={item} style={styles.materialCard}>
            <SkeletonBlock pulse={pulse} style={styles.materialTitle} />
            <SkeletonBlock pulse={pulse} style={styles.materialBody} />
            <SkeletonBlock pulse={pulse} style={styles.materialBodyWide} />
            <View style={styles.materialActions}>
              <SkeletonBlock pulse={pulse} style={styles.materialActionBtn} />
              <SkeletonBlock pulse={pulse} style={styles.materialActionBtn} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function makeModuleWorkspaceSkeletonStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas },
    content: { paddingBottom: 32 },
    hero: {
      paddingTop: 24,
      paddingBottom: 28,
      paddingHorizontal: 20,
      backgroundColor: colors.brandDeep,
    },
    coursePill: {
      width: 138,
      height: 28,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    heroTitle: {
      marginTop: 16,
      width: "64%",
      height: 28,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.3)",
    },
    heroLine: {
      marginTop: 12,
      width: "82%",
      height: 14,
      borderRadius: 7,
      backgroundColor: "rgba(255,255,255,0.24)",
    },
    heroLineWide: {
      marginTop: 8,
      width: "95%",
      height: 14,
      borderRadius: 7,
      backgroundColor: "rgba(255,255,255,0.24)",
    },
    heroMeta: {
      marginTop: 12,
      width: 168,
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    heroActions: {
      flexDirection: "row",
      marginTop: 18,
      gap: 10,
    },
    heroActionBtn: {
      flex: 1,
      height: 42,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 12,
    },
    sectionTitle: { width: 100, height: 20, borderRadius: 6 },
    sectionSubtitle: {
      marginTop: 8,
      width: 220,
      height: 12,
      borderRadius: 6,
    },
    addBtn: {
      width: 62,
      height: 38,
      borderRadius: 10,
    },
    searchBar: {
      marginHorizontal: 16,
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    filterRow: {
      marginTop: 10,
      marginHorizontal: 16,
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      width: 74,
      height: 32,
      borderRadius: 16,
    },
    materialsList: {
      marginTop: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    materialCard: {
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
    },
    materialTitle: {
      width: "72%",
      height: 16,
    },
    materialBody: {
      marginTop: 10,
      width: "92%",
      height: 12,
    },
    materialBodyWide: {
      marginTop: 8,
      width: "84%",
      height: 12,
    },
    materialActions: {
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    materialActionBtn: {
      width: 56,
      height: 28,
      borderRadius: 9,
    },
  });
}
