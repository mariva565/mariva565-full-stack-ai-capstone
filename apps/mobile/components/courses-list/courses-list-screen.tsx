import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { BrandedSpinner } from "../branded-spinner";
import { ConfirmModal } from "../confirm-modal";
import { EmptyState } from "../empty-state";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { CourseCard } from "./course-card";
import { styles } from "./courses-list.styles";
import type { CoursesListViewModel } from "./courses-list.types";

type CoursesListScreenProps = { viewModel: CoursesListViewModel };

function CoursesHeader({
  userName,
  total,
  published,
  drafts,
}: {
  userName: string;
  total: number;
  published: number;
  drafts: number;
}) {
  return (
    <LinearGradient
      colors={GRADIENTS.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <Text style={styles.headerName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>{total === 1 ? "Course" : "Courses"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{published}</Text>
          <Text style={styles.statLabel}>Published</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{drafts}</Text>
          <Text style={styles.statLabel}>Drafts</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading courses"
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function CoursesState({ viewModel }: CoursesListScreenProps) {
  if (viewModel.loading) {
    return <BrandedSpinner message="Loading courses..." />;
  }
  if (viewModel.error) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.retry} />;
  }
  if (viewModel.courses.length === 0) {
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
    >
      <LinearGradient colors={GRADIENTS.primaryAction} style={styles.fabGradient}>
        <Text style={styles.fabText}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function CoursesListScreen({ viewModel }: CoursesListScreenProps) {
  return (
    <View style={styles.container}>
      <CoursesHeader
        userName={viewModel.userName}
        total={viewModel.stats.total}
        published={viewModel.stats.published}
        drafts={viewModel.stats.drafts}
      />
      <CoursesState viewModel={viewModel} />

      <CreateCourseFab onPress={viewModel.openCreateCourse} />

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
