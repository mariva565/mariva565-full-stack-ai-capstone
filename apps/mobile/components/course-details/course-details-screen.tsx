import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";

import { BrandedSpinner } from "../branded-spinner";
import { ConfirmModal } from "../confirm-modal";
import { EmptyState } from "../empty-state";
import { ModuleListCard } from "../module-list-card";
import { COLORS, GRADIENTS } from "../../lib/colors";
import type { Module } from "../../lib/studyhub-types";
import { styles } from "./course-details.styles";
import {
  useCourseDetailsScreen,
  type CourseDetailsViewModel,
} from "./use-course-details-screen";

type LoadedCourseDetailsViewModel = CourseDetailsViewModel & {
  course: NonNullable<CourseDetailsViewModel["course"]>;
};

function CourseHero({
  routeId,
  title,
  description,
  modulesCount,
  createdAt,
  onEditCourse,
  onDeleteCourse,
}: {
  routeId: string;
  title: string;
  description: string | null;
  modulesCount: number;
  createdAt: string;
  onEditCourse: (routeId: string) => void;
  onDeleteCourse: () => void;
}) {
  return (
    <LinearGradient colors={GRADIENTS.heroStrong} style={styles.hero}>
      <Text style={styles.heroEyebrow}>Course overview</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      {description ? <Text style={styles.heroDesc}>{description}</Text> : null}
      <View style={styles.heroMetaRow}>
        <Text style={styles.heroMeta}>{modulesCount} modules</Text>
        {createdAt && !isNaN(new Date(createdAt).getTime()) ? (
          <Text style={styles.heroMeta}>Created {new Date(createdAt).toLocaleDateString()}</Text>
        ) : null}
      </View>
      <View style={styles.courseActionsRow}>
        <TouchableOpacity
          style={[styles.courseActionBtn, styles.courseEditBtn]}
          onPress={() => onEditCourse(routeId)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Edit course ${title}`}
        >
          <Text style={[styles.courseActionText, styles.courseEditText]}>Edit Course</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.courseActionBtn, styles.courseDeleteBtn]}
          onPress={onDeleteCourse}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Delete course ${title}`}
        >
          <Text style={[styles.courseActionText, styles.courseDeleteText]}>Delete Course</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function ModulesSection({
  routeId,
  modules,
  onAddModule,
  onOpenModule,
  onEditModule,
  onDeleteModule,
}: {
  routeId: string;
  modules: Module[];
  onAddModule: (routeId: string) => void;
  onOpenModule: (moduleId: number) => void;
  onEditModule: (moduleId: number) => void;
  onDeleteModule: (module: Module) => void;
}) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Modules</Text>
          <Text style={styles.sectionSubtitle}>
            Open a module to manage its materials in a dedicated workspace.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addModuleBtn}
          onPress={() => onAddModule(routeId)}
          accessibilityRole="button"
          accessibilityLabel="Add module"
        >
          <Text style={styles.addModuleBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {modules.length === 0 ? (
        <EmptyState
          icon="Modules"
          title="No modules yet"
          subtitle="Add your first module to start organizing materials."
        />
      ) : (
        modules.map((module, index) => (
          <ModuleListCard
            key={module.id}
            index={index}
            module={module}
            onOpen={() => onOpenModule(module.id)}
            onEdit={() => onEditModule(module.id)}
            onDelete={() => onDeleteModule(module)}
          />
        ))
      )}
    </>
  );
}

export function CourseDetailsScreen({ routeId }: { routeId: string }) {
  const viewModel = useCourseDetailsScreen(routeId);

  if (viewModel.loading) {
    return <CourseDetailsLoading />;
  }

  if (viewModel.error || !viewModel.course) {
    return <CourseDetailsError error={viewModel.error} onRetry={viewModel.retry} />;
  }

  return <CourseDetailsContent viewModel={viewModel as LoadedCourseDetailsViewModel} />;
}

function CourseDetailsLoading() {
  return (
    <>
      <Stack.Screen options={{ title: "Loading..." }} />
      <BrandedSpinner message="Loading course..." />
    </>
  );
}

function CourseDetailsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Stack.Screen options={{ title: "Error" }} />
      <Text style={styles.errorText}>{error || "Course not found"}</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading course"
      >
        <Text style={styles.retryBtnText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function CourseDetailsContent({
  viewModel,
}: {
  viewModel: LoadedCourseDetailsViewModel;
}) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.refreshing}
            onRefresh={viewModel.refresh}
            tintColor={COLORS.brandPrimary}
          />
        }
      >
        <Stack.Screen options={{ title: viewModel.course.title }} />
        <CourseHero
          routeId={viewModel.routeId}
          title={viewModel.course.title}
          description={viewModel.course.description}
          modulesCount={viewModel.modules.length}
          createdAt={viewModel.course.createdAt}
          onEditCourse={(targetId) =>
            router.push({ pathname: "/course/[id]/edit", params: { id: targetId } })
          }
          onDeleteCourse={viewModel.openDeleteCourse}
        />
        <ModulesSection
          routeId={viewModel.routeId}
          modules={viewModel.modules}
          onAddModule={(targetId) =>
            router.push({ pathname: "/course/[id]/add-module", params: { id: targetId } })
          }
          onOpenModule={(moduleId) =>
            router.push({ pathname: "/module/[id]", params: { id: moduleId } })
          }
          onEditModule={(moduleId) =>
            router.push({ pathname: "/module/[id]/edit", params: { id: moduleId } })
          }
          onDeleteModule={viewModel.openDeleteModule}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ConfirmModal
        visible={viewModel.confirmVisible}
        title={viewModel.confirmTitle}
        message={viewModel.confirmMessage}
        confirmLabel="Delete"
        destructive
        onConfirm={viewModel.confirmDelete}
        onCancel={viewModel.closeConfirm}
      />
    </View>
  );
}
