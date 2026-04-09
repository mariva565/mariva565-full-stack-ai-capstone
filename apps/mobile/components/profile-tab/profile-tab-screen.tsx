import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { BrandedSpinner } from "../branded-spinner";
import { COLORS, GRADIENTS } from "../../lib/colors";
import type { ProfileTabViewModel } from "./profile-tab.types";
import { styles } from "./profile-tab.styles";

type ProfileTabScreenProps = {
  viewModel: ProfileTabViewModel;
};

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error || "Not found"}</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading profile"
      >
        <Text style={styles.retryBtnText}>Retry</Text>
      </TouchableOpacity>
    </View>
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
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, viewModel.saving && styles.saveBtnDisabled]}
            onPress={viewModel.saveProfile}
            disabled={viewModel.saving}
            accessibilityRole="button"
            accessibilityLabel="Save profile"
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
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ProfileTabScreen({ viewModel }: ProfileTabScreenProps) {
  if (viewModel.loading) {
    return <BrandedSpinner message="Loading profile..." />;
  }
  if (viewModel.error || !viewModel.profile) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.retry} />;
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
      <ProfileInfoCard viewModel={viewModel} />
      <ProfileActions viewModel={viewModel} />
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
