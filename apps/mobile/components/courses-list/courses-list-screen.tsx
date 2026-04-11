import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { ConfirmModal } from "../confirm-modal";
import { NetworkBanner } from "../network-banner";
import { RequestState } from "../request-state";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { useIsOffline } from "../../lib/network";
import { CourseCard } from "./course-card";
import { CoursesListSkeleton } from "./courses-list-skeleton";
import { CoursesHeader } from "./courses-header";
import { NoCoursesState } from "./no-courses-state";
import { makeCoursesListStyles, type CoursesListStyles } from "./courses-list.styles";
import type { CoursesListViewModel } from "./courses-list.types";

type CoursesListScreenProps = { viewModel: CoursesListViewModel };


function CoursesState({
  viewModel,
  offline,
  styles,
  primaryTint,
}: CoursesListScreenProps & {
  offline: boolean;
  styles: CoursesListStyles;
  primaryTint: string;
}) {
  if (viewModel.loading) {
    return <CoursesListSkeleton />;
  }
  if (viewModel.error) {
    if (offline) {
      return (
        <RequestState
          icon="Offline"
          title="You are offline"
          subtitle="Reconnect to load your latest courses."
          actionLabel="Retry"
          onAction={viewModel.retry}
          accessibilityLabel="Retry loading courses while offline"
        />
      );
    }

    return (
      <RequestState
        icon="Error"
        title="Could not load courses"
        subtitle={viewModel.error}
        actionLabel="Retry"
        onAction={viewModel.retry}
        accessibilityLabel="Retry loading courses"
      />
    );
  }
  if (viewModel.courses.length === 0) {
    if (offline) {
      return (
        <RequestState
          icon="Offline"
          title="No offline courses yet"
          subtitle="Reconnect to sync your courses."
          actionLabel="Retry"
          onAction={viewModel.retry}
          accessibilityLabel="Retry syncing courses"
        />
      );
    }

    return <NoCoursesState styles={styles} />;
  }

  return (
    <FlatList
      data={viewModel.courses}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        offline ? (
          <NetworkBanner message="Showing last synced courses until connection is restored." />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={viewModel.refreshing}
          onRefresh={viewModel.refresh}
          tintColor={primaryTint}
        />
      }
      renderItem={({ item, index }) => (
        <CourseCard
          course={item}
          index={index}
          onOpen={() => viewModel.openCourse(item.id)}
          onEdit={() => viewModel.editCourse(item.id)}
          onDelete={() => viewModel.openDeleteCourse(item)}
          styles={styles}
        />
      )}
    />
  );
}

function CreateCourseFab({
  onPress,
  styles,
  primaryActionGradient,
}: {
  onPress: () => void;
  styles: CoursesListStyles;
  primaryActionGradient: readonly [string, string];
}) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Create course"
      accessibilityHint="Opens the create course form"
    >
      <LinearGradient colors={primaryActionGradient} style={styles.fabGradient}>
        <Text style={styles.fabText} maxFontSizeMultiplier={1.2}>
          +
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function CoursesListScreen({ viewModel }: CoursesListScreenProps) {
  const offline = useIsOffline();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeCoursesListStyles);
  const heroGradient = [colors.brandDeep, colors.brandPrimary] as const;
  const primaryActionGradient = [colors.brandPrimary, colors.brandAccent] as const;
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CoursesHeader
        userName={viewModel.userName}
        coursesCount={viewModel.stats.courses}
        modulesCount={viewModel.stats.modules}
        materialsCount={viewModel.stats.materials}
        styles={styles}
        heroGradient={heroGradient}
        onChat={() => router.push("/chat")}
      />
      <CoursesState
        viewModel={viewModel}
        offline={offline}
        styles={styles}
        primaryTint={colors.brandPrimary}
      />

      {!viewModel.loading ? (
        <CreateCourseFab
          onPress={viewModel.openCreateCourse}
          styles={styles}
          primaryActionGradient={primaryActionGradient}
        />
      ) : null}

      <ConfirmModal
        visible={viewModel.confirmVisible}
        title="Delete course"
        message={`Delete "${viewModel.deleteTargetTitle}"? This will also remove its modules and materials.`}
        confirmLabel="Delete"
        destructive
        onConfirm={viewModel.confirmDeleteCourse}
        onCancel={viewModel.cancelDeleteCourse}
      />
    </View>
  );
}
