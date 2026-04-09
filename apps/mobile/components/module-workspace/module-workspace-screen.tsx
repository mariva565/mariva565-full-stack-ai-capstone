import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { BrandedSpinner } from "../branded-spinner";
import { ConfirmModal } from "../confirm-modal";
import { EmptyState } from "../empty-state";
import { MaterialCard } from "../material-card";
import { SearchBar } from "../search-bar";
import { TypeFilterChips } from "../type-filter-chips";
import { COLORS, GRADIENTS } from "../../lib/colors";
import type { ModuleWorkspaceViewModel } from "./module-workspace.types";
import { styles } from "./module-workspace.styles";

type ModuleWorkspaceScreenProps = {
  viewModel: ModuleWorkspaceViewModel;
};

type ModuleHeroProps = {
  viewModel: ModuleWorkspaceViewModel;
};

type MaterialsSectionProps = {
  viewModel: ModuleWorkspaceViewModel;
};

function LoadingState() {
  return (
    <>
      <Stack.Screen options={{ title: "Loading..." }} />
      <BrandedSpinner message="Loading module..." />
    </>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Stack.Screen options={{ title: "Error" }} />
      <Text style={styles.errorText}>{error || "Module not found"}</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading module"
      >
        <Text style={styles.retryBtnText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function ModuleHero({ viewModel }: ModuleHeroProps) {
  if (!viewModel.context) {
    return null;
  }
  const { context, materials } = viewModel;

  return (
    <LinearGradient colors={GRADIENTS.heroStrong} style={styles.hero}>
      <TouchableOpacity
        style={styles.coursePill}
        onPress={viewModel.openCourse}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Open course ${context.course.title}`}
      >
        <Text style={styles.coursePillText}>{context.course.title}</Text>
      </TouchableOpacity>

      <Text style={styles.heroTitle}>{context.module.title}</Text>
      <Text style={styles.heroDesc}>
        {context.module.description?.trim() || "Module workspace for managing your study materials."}
      </Text>
      <Text style={styles.heroMeta}>{materials.length} materials in this workspace</Text>

      <View style={styles.heroActions}>
        <TouchableOpacity
          style={[styles.heroBtn, styles.heroGhostBtn]}
          onPress={viewModel.editModule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Edit module ${context.module.title}`}
        >
          <Text style={styles.heroGhostBtnText}>Edit Module</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.heroBtn, styles.heroDangerBtn]}
          onPress={viewModel.openDeleteModule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Delete module ${context.module.title}`}
        >
          <Text style={styles.heroDangerBtnText}>Delete Module</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function MaterialsSection({ viewModel }: MaterialsSectionProps) {
  const { materials, filteredMaterials } = viewModel;

  return (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Materials</Text>
          <Text style={styles.sectionSubtitle}>Open any item for detail view and editing.</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={viewModel.addMaterial}
          accessibilityRole="button"
          accessibilityLabel="Add material"
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {materials.length > 0 ? (
        <>
          <SearchBar
            value={viewModel.searchQuery}
            onChangeText={viewModel.setSearchQuery}
            placeholder="Search materials..."
          />
          <TypeFilterChips selected={viewModel.typeFilter} onSelect={viewModel.setTypeFilter} />
        </>
      ) : null}

      {materials.length === 0 ? (
        <EmptyState
          icon="Notes"
          title="No materials yet"
          subtitle="Add a note, link, file, or video to start this module."
        />
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          icon="Search"
          title="No matches"
          subtitle={viewModel.hasFilters ? "Try a different search or filter." : "No materials found."}
        />
      ) : (
        <View style={styles.materialsList}>
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onOpen={() => viewModel.openMaterial(material.id)}
              onEdit={() => viewModel.editMaterial(material.id)}
              onDelete={() => viewModel.openDeleteMaterial(material)}
            />
          ))}
        </View>
      )}
    </>
  );
}

export function ModuleWorkspaceScreen({ viewModel }: ModuleWorkspaceScreenProps) {
  if (viewModel.loading) {
    return <LoadingState />;
  }
  if (viewModel.error || !viewModel.context) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.retry} />;
  }

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
        <Stack.Screen options={{ title: viewModel.context.module.title }} />
        <ModuleHero viewModel={viewModel} />
        <MaterialsSection viewModel={viewModel} />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ConfirmModal
        visible={viewModel.confirmVisible}
        title={viewModel.confirmTitle}
        message={viewModel.confirmMessage}
        confirmLabel="Delete"
        destructive
        onConfirm={viewModel.confirmDelete}
        onCancel={viewModel.cancelDelete}
      />
    </View>
  );
}
