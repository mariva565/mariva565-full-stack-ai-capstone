import { useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { useIsOffline } from "../../lib/network";
import { NetworkBanner } from "../network-banner";
import { RequestState } from "../request-state";
import { ProfileTabSkeleton } from "./profile-tab-skeleton";
import type { ProfileTabViewModel } from "./profile-tab.types";
import { makeProfileTabStyles } from "./profile-tab.styles";
import { ProfileQrCard } from "./profile-qr-card";
import { QrScannerScreen } from "./qr-scanner-screen";
import { AvatarUploadButton } from "./avatar-upload-button";

type ProfileTabScreenProps = {
  viewModel: ProfileTabViewModel;
};

type ProfileTabRenderProps = {
  styles: ReturnType<typeof makeProfileTabStyles>;
  heroGradient: readonly [string, string];
  primaryActionGradient: readonly [string, string];
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

function ProfileHero({
  viewModel,
  styles,
  heroGradient,
}: ProfileTabScreenProps & Pick<ProfileTabRenderProps, "styles" | "heroGradient">) {
  if (!viewModel.profile) {
    return null;
  }

  return (
    <LinearGradient
      colors={heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <AvatarUploadButton
        avatarUrl={viewModel.profile.avatarUrl}
        initials={viewModel.initials}
        onUploadSuccess={viewModel.onAvatarUploaded}
        styles={styles}
      />
      <Text style={styles.heroName}>{viewModel.profile.name}</Text>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{viewModel.profile.role}</Text>
      </View>
    </LinearGradient>
  );
}

function ProfileInfoCard({ viewModel, styles }: ProfileTabScreenProps & Pick<ProfileTabRenderProps, "styles">) {
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

function ProfileActions({
  viewModel,
  styles,
  primaryActionGradient,
  onScanQr,
}: ProfileTabScreenProps &
  Pick<ProfileTabRenderProps, "styles" | "primaryActionGradient"> & {
    onScanQr: () => void;
  }) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={viewModel.openSettings}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        accessibilityHint="Opens mobile settings"
      >
        <Text style={styles.settingsBtnText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.scanQrBtn}
        onPress={onScanQr}
        accessibilityRole="button"
        accessibilityLabel="Scan QR code"
        accessibilityHint="Opens camera to scan another user's QR code and start a conversation"
      >
        <Text style={styles.scanQrBtnText}>Scan QR Code</Text>
      </TouchableOpacity>

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
              colors={primaryActionGradient}
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
          accessibilityHint="Enables display name editing; avatar can be changed from the profile photo above"
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ProfileTabScreen({ viewModel }: ProfileTabScreenProps) {
  const offline = useIsOffline();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeProfileTabStyles);
  const heroGradient = [colors.brandDeep, colors.brandPrimary] as const;
  const primaryActionGradient = [colors.brandPrimary, colors.brandAccent] as const;
  const [scannerOpen, setScannerOpen] = useState(false);

  if (viewModel.loading) {
    return <ProfileTabSkeleton />;
  }
  if (viewModel.error || !viewModel.profile) {
    return <ErrorState error={viewModel.error} onRetry={viewModel.retry} offline={offline} />;
  }

  return (
    <>
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
        <ProfileHero viewModel={viewModel} styles={styles} heroGradient={heroGradient} />
        {offline ? (
          <View style={styles.offlineBannerWrap}>
            <NetworkBanner message="Showing last synced profile data until connection is restored." />
          </View>
        ) : null}
        <ProfileInfoCard viewModel={viewModel} styles={styles} />
        <ProfileQrCard userId={viewModel.profile.id} />
        <ProfileActions
          viewModel={viewModel}
          styles={styles}
          primaryActionGradient={primaryActionGradient}
          onScanQr={() => setScannerOpen(true)}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <QrScannerScreen
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </>
  );
}
