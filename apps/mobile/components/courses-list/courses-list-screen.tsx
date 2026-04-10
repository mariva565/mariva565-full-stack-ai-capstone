import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ConfirmModal } from "../confirm-modal";
import { NetworkBanner } from "../network-banner";
import { RequestState } from "../request-state";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { useIsOffline } from "../../lib/network";
import { CourseCard } from "./course-card";
import { CoursesListSkeleton } from "./courses-list-skeleton";
import { makeCoursesListStyles, type CoursesListStyles } from "./courses-list.styles";
import type { CoursesListViewModel } from "./courses-list.types";

type CoursesListScreenProps = { viewModel: CoursesListViewModel };

function NoCoursesState({ styles }: { styles: CoursesListStyles }) {
  return (
    <View style={styles.noCoursesWrap}>
      <View style={styles.noCoursesCard}>
        <Image
          source={require("../../assets/branding/mascot.png")}
          style={styles.noCoursesMascot}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.noCoursesTitle} maxFontSizeMultiplier={1.2}>
          Study<Text style={styles.brandTitleAccent}>Hub</Text>
        </Text>
        <Text style={styles.noCoursesHeading} maxFontSizeMultiplier={1.2}>
          No courses yet
        </Text>
        <Text style={styles.noCoursesSubtitle} maxFontSizeMultiplier={1.2}>
          Tap + to create your first course.
        </Text>
      </View>
    </View>
  );
}

function CoursesHeader({
  userName,
  coursesCount,
  modulesCount,
  materialsCount,
  styles,
  heroGradient,
}: {
  userName: string;
  coursesCount: number;
  modulesCount: number;
  materialsCount: number;
  styles: CoursesListStyles;
  heroGradient: readonly [string, string];
}) {
  return (
    <LinearGradient
      colors={heroGradient}
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

  return (
    <View style={styles.container}>
      <CoursesHeader
        userName={viewModel.userName}
        coursesCount={viewModel.stats.courses}
        modulesCount={viewModel.stats.modules}
        materialsCount={viewModel.stats.materials}
        styles={styles}
        heroGradient={heroGradient}
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
