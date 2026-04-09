import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS, GRADIENTS } from "../../lib/colors";
import { useIsOffline } from "../../lib/network";
import { NetworkBanner } from "../network-banner";
import { RequestState } from "../request-state";
import { ProfileTabSkeleton } from "./profile-tab-skeleton";
import type { ProfileTabViewModel } from "./profile-tab.types";
import { styles } from "./profile-tab.styles";

type ProfileTabScreenProps = {
  viewModel: ProfileTabViewModel;
};

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
    <RequestState
      icon={offline ? "Offline" : "Error"}
      title={offline ? "You are offline" : "Could not load profile"}
      subtitle={offline ? "Reconnect to load your profile." : error || "Profile not found"}
      actionLabel="Retry"
      onAction={onRetry}
      accessibilityLabel={
        offline ? "Retry loading profile while offline" : "Retry loading profile"
      }
    />
  );
}

function ProfileHero({ viewModel }: ProfileTabScreenProps) {
  if (!viewModel.profile) {
    return null;
  }

  return (
    <LinearGradient
      colors={GRADIENTS.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{viewModel.initials}</Text>
      </View>
      <Text style={styles.heroName}>{viewModel.profile.name}</Text>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{viewModel.profile.role}</Text>
      </View>
    </LinearGradient>
  );
}

function ProfileInfoCard({ viewModel }: ProfileTabScreenProps) {
  if (!viewModel.profile) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Email</Text>
        <Text style={styles.fieldValue}>{viewModel.profile.email}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Name</Text>
        {viewModel.editing ? (
          <TextInput
            style={styles.editInput}
            value={viewModel.editName}
            onChangeText={viewModel.setEditName}
            autoFocus
            accessibilityLabel="Profile name"
            accessibilityHint="Edit your display name"
            maxFontSizeMultiplier={1.4}
          />
        ) : (
          <Text style={styles.fieldValue}>{viewModel.profile.name}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Member since</Text>
        <Text style={styles.fieldValue}>
          {new Date(viewModel.profile.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

function ProfileActions({ viewModel }: ProfileTabScreenProps) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={viewModel.logout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        accessibilityHint="Signs you out of the current account"
      >
        <Text style={styles.logoutBtnText}>Log out</Text>
      </TouchableOpacity>

      {viewModel.editing ? (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={viewModel.cancelEditing}
            accessibilityRole="button"
            accessibilityLabel="Cancel profile editing"
            accessibilityHint="Discard name changes"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, viewModel.saving && styles.saveBtnDisabled]}
            onPress={viewModel.saveProfile}
            disabled={viewModel.saving}
            accessibilityRole="button"
            accessibilityLabel="Save profile"
            accessibilityHint="Saves your updated profile name"
          >
            <LinearGradient
              colors={GRADIENTS.primaryAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Text style={styles.saveBtnText}>{viewModel.saving ? "Saving..." : "Save"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={viewModel.startEditing}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          accessibilityHint="Enables profile name editing"
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ProfileTabScreen({ viewModel }: ProfileTabScreenProps) {
  const offline = useIsOffline();

  if (viewModel.loading) {
    return <ProfileTabSkeleton />;
  }
  if (viewModel.error || !viewModel.profile) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.retry} offline={offline} />;
  }

  return (
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
      <ProfileHero viewModel={viewModel} />
      {offline ? (
        <View style={styles.offlineBannerWrap}>
          <NetworkBanner message="Showing last synced profile data until connection is restored." />
        </View>
      ) : null}
      <ProfileInfoCard viewModel={viewModel} />
      <ProfileActions viewModel={viewModel} />
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
