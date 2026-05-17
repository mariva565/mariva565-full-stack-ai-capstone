import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { ConfirmModal } from "../confirm-modal";
import { EmptyState } from "../empty-state";
import { MaterialCard } from "../material-card";
import { NetworkBanner } from "../network-banner";
import { RequestState } from "../request-state";
import { SearchBar } from "../search-bar";
import { TypeFilterChips } from "../type-filter-chips";
import { DetailBackButton } from "../detail-back-button";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { useIsOffline } from "../../lib/network";
import { ModuleWorkspaceSkeleton } from "./module-workspace-skeleton";
import type { ModuleWorkspaceViewModel } from "./module-workspace.types";
import { makeModuleWorkspaceStyles } from "./module-workspace.styles";

type ModuleWorkspaceScreenProps = {
  viewModel: ModuleWorkspaceViewModel;
};

type ModuleHeroProps = {
  viewModel: ModuleWorkspaceViewModel;
};

type MaterialsSectionProps = {
  viewModel: ModuleWorkspaceViewModel;
  offline: boolean;
};

function LoadingState() {
  return (
    <>
      <Stack.Screen options={{ title: "Loading..." }} />
      <ModuleWorkspaceSkeleton />
    </>
  );
}

function ErrorState({
  error,
  onRetry,
  offline,
}: {
  error: string;
  onRetry: () => void;
  offline: boolean;
}) {
  return (
    <>
      <Stack.Screen options={{ title: "Error" }} />
      {offline ? (
        <RequestState
          icon="Offline"
          title="You are offline"
          subtitle="Reconnect to load this module workspace."
          actionLabel="Retry"
          onAction={onRetry}
          accessibilityLabel="Retry loading module while offline"
        />
      ) : (
        <RequestState
          icon="Error"
          title="Could not load module"
          subtitle={error || "Module not found"}
          actionLabel="Retry"
          onAction={onRetry}
          accessibilityLabel="Retry loading module"
        />
      )}
    </>
  );
}

function ModuleHero({ viewModel }: ModuleHeroProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeModuleWorkspaceStyles);
  if (!viewModel.context) {
    return null;
  }
  const { context, materials } = viewModel;
  const heroGradient = [colors.brandDeep, colors.brandPrimary, colors.brandAccent] as const;

  return (
    <LinearGradient colors={heroGradient} style={styles.hero}>
      <DetailBackButton
        label={context.course.title}
        onPress={viewModel.openCourse}
        accessibilityLabel={`Back to course ${context.course.title}`}
      />

      <Text style={styles.heroTitle} maxFontSizeMultiplier={1.3}>
        {context.module.title}
      </Text>
      <Text style={styles.heroDesc} maxFontSizeMultiplier={1.3}>
        {context.module.description?.trim() || "Module workspace for managing your study materials."}
      </Text>
      <Text style={styles.heroMeta} maxFontSizeMultiplier={1.2}>
        {materials.length} materials in this workspace
      </Text>

      <View style={styles.heroActions}>
        <TouchableOpacity
          style={[styles.heroBtn, styles.heroGhostBtn]}
          onPress={viewModel.editModule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Edit module ${context.module.title}`}
          accessibilityHint="Opens the module edit form"
        >
          <Text style={styles.heroGhostBtnText} maxFontSizeMultiplier={1.2}>
            Edit Module
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.heroBtn, styles.heroDangerBtn]}
          onPress={viewModel.openDeleteModule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Delete module ${context.module.title}`}
          accessibilityHint="Opens delete confirmation for this module"
        >
          <Text style={styles.heroDangerBtnText} maxFontSizeMultiplier={1.2}>
            Delete Module
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function MaterialsSection({ viewModel, offline }: MaterialsSectionProps) {
  const styles = useThemedStyles(makeModuleWorkspaceStyles);
  const { materials, filteredMaterials } = viewModel;

  return (
    <>
      {offline ? (
        <View style={styles.offlineBannerWrap}>
          <NetworkBanner message="Showing last synced materials until connection is restored." />
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.2}>
            Materials
          </Text>
          <Text style={styles.sectionSubtitle} maxFontSizeMultiplier={1.2}>
            Open any item for detail view and editing.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={viewModel.addMaterial}
          accessibilityRole="button"
          accessibilityLabel="Add material"
          accessibilityHint="Opens the add material form"
        >
          <Text style={styles.addBtnText} maxFontSizeMultiplier={1.2}>
            Add
          </Text>
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
        offline ? (
          <RequestState
            icon="Offline"
            title="No offline materials yet"
            subtitle="Reconnect to sync module materials."
            actionLabel="Retry"
            onAction={viewModel.retry}
            accessibilityLabel="Retry syncing module materials"
          />
        ) : (
          <EmptyState
            icon="Notes"
            title="No materials yet"
            subtitle="Add a note, link, file, or video to start this module."
          />
        )
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
              isPinned={viewModel.isMaterialPinned(material.id)}
              favoriteBusy={viewModel.isFavoriteBusy(material.id)}
              onToggleFavorite={() => viewModel.toggleMaterialFavorite(material)}
            />
          ))}
        </View>
      )}
    </>
  );
}

export function ModuleWorkspaceScreen({ viewModel }: ModuleWorkspaceScreenProps) {
  const offline = useIsOffline();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeModuleWorkspaceStyles);

  if (viewModel.loading) {
    return <LoadingState />;
  }
  if (viewModel.error || !viewModel.context) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.retry} offline={offline} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.refreshing}
            onRefresh={viewModel.refresh}
            tintColor={colors.brandPrimary}
          />
        }
      >
        <Stack.Screen options={{ title: viewModel.context.module.title }} />
        <ModuleHero viewModel={viewModel} />
        <MaterialsSection viewModel={viewModel} offline={offline} />
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
