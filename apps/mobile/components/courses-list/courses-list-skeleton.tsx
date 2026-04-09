import { StyleSheet, View } from "react-native";

import { COLORS } from "../../lib/colors";
import { SkeletonBlock, useSkeletonPulse } from "../skeleton/skeleton-block";

const COURSE_CARD_PLACEHOLDERS = [1, 2, 3];
const STATS_PLACEHOLDERS = [1, 2, 3];

export function CoursesListSkeleton() {
  const pulse = useSkeletonPulse();

  return (
    <View style={styles.container} importantForAccessibility="no-hide-descendants">
      <View style={styles.header}>
        <SkeletonBlock pulse={pulse} style={styles.greeting} />
        <SkeletonBlock pulse={pulse} style={styles.userName} />

        <View style={styles.statsRow}>
          {STATS_PLACEHOLDERS.map((item) => (
            <View key={item} style={styles.statCard}>
              <SkeletonBlock pulse={pulse} style={styles.statNumber} />
              <SkeletonBlock pulse={pulse} style={styles.statLabel} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.list}>
        {COURSE_CARD_PLACEHOLDERS.map((item) => (
          <View key={item} style={styles.card}>
            <SkeletonBlock pulse={pulse} style={styles.cardAccent} />
            <View style={styles.cardBody}>
              <SkeletonBlock pulse={pulse} style={styles.cardTitle} />
              <SkeletonBlock pulse={pulse} style={styles.cardLine} />
              <SkeletonBlock pulse={pulse} style={styles.cardLineShort} />
            </View>
            <View style={styles.cardActions}>
              <SkeletonBlock pulse={pulse} style={styles.actionButton} />
              <SkeletonBlock pulse={pulse} style={styles.actionButton} />
            </View>
          </View>
        ))}
      </View>

      <SkeletonBlock pulse={pulse} style={styles.fabPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.brandDeep,
  },
  greeting: {
    width: 110,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  userName: {
    marginTop: 10,
    width: 176,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.26)",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statNumber: {
    width: 34,
    height: 20,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  statLabel: {
    marginTop: 8,
    width: 54,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  list: {
    padding: 16,
    paddingBottom: 96,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardAccent: {
    height: 4,
    borderRadius: 0,
    backgroundColor: COLORS.violetSoft,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  cardTitle: {
    width: "74%",
    height: 18,
  },
  cardLine: {
    marginTop: 10,
    width: "94%",
    height: 13,
  },
  cardLineShort: {
    marginTop: 8,
    width: "64%",
    height: 13,
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    width: 60,
    height: 30,
    borderRadius: 10,
  },
  fabPlaceholder: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.violetBorder,
  },
});
