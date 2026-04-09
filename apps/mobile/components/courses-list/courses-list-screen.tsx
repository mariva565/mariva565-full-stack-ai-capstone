import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ConfirmModal } from "../confirm-modal";
import { EmptyState } from "../empty-state";
import { NetworkBanner } from "../network-banner";
import { RequestState } from "../request-state";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { useIsOffline } from "../../lib/network";
import { CourseCard } from "./course-card";
import { CoursesListSkeleton } from "./courses-list-skeleton";
import { styles } from "./courses-list.styles";
import type { CoursesListViewModel } from "./courses-list.types";

type CoursesListScreenProps = { viewModel: CoursesListViewModel };

function CoursesHeader({
  userName,
  coursesCount,
  modulesCount,
  materialsCount,
}: {
  userName: string;
  coursesCount: number;
  modulesCount: number;
  materialsCount: number;
}) {
  return (
    <LinearGradient
      colors={GRADIENTS.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/branding/mascot.png")}
            style={styles.brandMascot}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <View>
            <Text style={styles.brandTitle}>
              Study<Text style={styles.brandTitleAccent}>Hub</Text>
            </Text>
            <Text style={styles.brandSubtitle} maxFontSizeMultiplier={1.2}>
              Learn smarter, every day.
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.headerGreeting} maxFontSizeMultiplier={1.2}>
            Welcome back,
          </Text>
          <Text style={styles.headerName} maxFontSizeMultiplier={1.3}>
            {userName}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
            {coursesCount}
          </Text>
          <Text style={styles.statLabel} maxFontSizeMultiplier={1.2}>
            {coursesCount === 1 ? "Course" : "Courses"}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
            {modulesCount}
          </Text>
          <Text style={styles.statLabel} maxFontSizeMultiplier={1.2}>
            {modulesCount === 1 ? "Module" : "Modules"}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
            {materialsCount}
          </Text>
          <Text style={styles.statLabel} maxFontSizeMultiplier={1.2}>
            {materialsCount === 1 ? "Material" : "Materials"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function CoursesState({
  viewModel,
  offline,
}: CoursesListScreenProps & { offline: boolean }) {
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

    return (
      <EmptyState
        icon="Courses"
        title="No courses yet"
        subtitle="Tap + to create your first course"
      />
    );
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
          tintColor={COLORS.brandPrimary}
        />
      }
      renderItem={({ item, index }) => (
        <CourseCard
          course={item}
          index={index}
          onOpen={() => viewModel.openCourse(item.id)}
          onEdit={() => viewModel.editCourse(item.id)}
          onDelete={() => viewModel.openDeleteCourse(item)}
        />
      )}
    />
  );
}

function CreateCourseFab({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Create course"
      accessibilityHint="Opens the create course form"
    >
      <LinearGradient colors={GRADIENTS.primaryAction} style={styles.fabGradient}>
        <Text style={styles.fabText} maxFontSizeMultiplier={1.2}>
          +
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function CoursesListScreen({ viewModel }: CoursesListScreenProps) {
  const offline = useIsOffline();

  return (
    <View style={styles.container}>
      <CoursesHeader
        userName={viewModel.userName}
        coursesCount={viewModel.stats.courses}
        modulesCount={viewModel.stats.modules}
        materialsCount={viewModel.stats.materials}
      />
      <CoursesState viewModel={viewModel} offline={offline} />

      {!viewModel.loading ? <CreateCourseFab onPress={viewModel.openCreateCourse} /> : null}

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
