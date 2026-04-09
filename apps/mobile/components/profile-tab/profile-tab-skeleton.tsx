import { ScrollView, StyleSheet, View } from "react-native";

import { COLORS } from "../../lib/colors";
import { SkeletonBlock, useSkeletonPulse } from "../skeleton/skeleton-block";

const PROFILE_FIELD_PLACEHOLDERS = [1, 2, 3];

export function ProfileTabSkeleton() {
  const pulse = useSkeletonPulse();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.hero}>
        <SkeletonBlock pulse={pulse} style={styles.avatar} />
        <SkeletonBlock pulse={pulse} style={styles.heroName} />
        <SkeletonBlock pulse={pulse} style={styles.heroBadge} />
      </View>

      <View style={styles.infoCard}>
        {PROFILE_FIELD_PLACEHOLDERS.map((item) => (
          <View key={item} style={styles.field}>
            <SkeletonBlock pulse={pulse} style={styles.fieldLabel} />
            <SkeletonBlock pulse={pulse} style={styles.fieldValue} />
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <SkeletonBlock pulse={pulse} style={styles.logoutBtn} />
        <SkeletonBlock pulse={pulse} style={styles.editBtn} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  content: { paddingBottom: 32 },
  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    backgroundColor: COLORS.brandDeep,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  heroName: {
    marginTop: 14,
    width: 162,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  heroBadge: {
    marginTop: 10,
    width: 76,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 14,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    width: 66,
    height: 10,
    borderRadius: 5,
  },
  fieldValue: {
    marginTop: 10,
    width: "78%",
    height: 16,
  },
  actions: {
    marginHorizontal: 16,
    gap: 12,
  },
  logoutBtn: {
    width: "100%",
    height: 46,
    borderRadius: 12,
  },
  editBtn: {
    width: "100%",
    height: 50,
    borderRadius: 12,
  },
});
