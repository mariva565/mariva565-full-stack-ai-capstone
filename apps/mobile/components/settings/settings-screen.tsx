import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import type { SettingsViewModel } from "./settings.types";
import { makeSettingsStyles } from "./settings-screen.styles";

type SettingsScreenProps = {
  viewModel: SettingsViewModel;
};

function ThemeModeSection({ viewModel }: SettingsScreenProps) {
  const styles = useThemedStyles(makeSettingsStyles);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>Theme mode</Text>
          <Text style={styles.rowMeta}>Pick how StudyHub should look.</Text>
        </View>
        <View style={styles.segmentedControl}>
          {viewModel.themeOptions.map((option) => {
            const active = option.value === viewModel.themeMode;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                onPress={() => viewModel.setThemeMode(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Theme mode ${option.label}`}
                accessibilityHint="Updates the app theme preference"
              >
                <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function HapticsSection({ viewModel }: SettingsScreenProps) {
  const styles = useThemedStyles(makeSettingsStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interaction</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>Haptics</Text>
            <Text style={styles.rowMeta}>Vibration feedback for toasts and actions.</Text>
          </View>
          <Switch
            value={viewModel.hapticsEnabled}
            onValueChange={viewModel.setHapticsEnabled}
            trackColor={{ false: colors.borderMuted, true: colors.brandAccent }}
            thumbColor={viewModel.hapticsEnabled ? colors.brandPrimary : "#f4f3f4"}
            accessibilityLabel="Toggle haptic feedback"
            accessibilityHint="Enable or disable vibration feedback"
          />
        </View>
      </View>
    </View>
  );
}

function AboutSection({ viewModel }: SettingsScreenProps) {
  const styles = useThemedStyles(makeSettingsStyles);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>App version</Text>
          <Text style={styles.rowMeta}>{viewModel.appVersionLabel}</Text>
        </View>
        {viewModel.aboutLinks.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={styles.linkButton}
            onPress={() => viewModel.openAboutLink(link.url)}
            accessibilityRole="link"
            accessibilityLabel={link.label}
            accessibilityHint={`Opens ${link.label} in your browser`}
          >
            <Text style={styles.linkButtonTitle}>{link.label}</Text>
            <Text style={styles.linkButtonMeta}>{link.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function AccountSection({ viewModel }: SettingsScreenProps) {
  const styles = useThemedStyles(makeSettingsStyles);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.accountButton}
          onPress={viewModel.openProfileEditor}
          accessibilityRole="button"
          accessibilityLabel="Edit profile details"
          accessibilityHint="Opens profile tab in edit mode"
        >
          <Text style={styles.accountButtonText}>Edit profile details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountButton, styles.logoutButton]}
          onPress={viewModel.logout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityHint="Signs you out from this device"
        >
          <Text style={[styles.accountButtonText, styles.logoutButtonText]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SettingsScreen({ viewModel }: SettingsScreenProps) {
  const styles = useThemedStyles(makeSettingsStyles);
  const { colors } = useTheme();

  if (!viewModel.ready) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={colors.brandPrimary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroOverline}>Mobile Settings</Text>
        <Text style={styles.heroTitle}>Tune your StudyHub app</Text>
        <Text style={styles.heroMeta}>Preferences are saved on this device.</Text>
      </View>
      <ThemeModeSection viewModel={viewModel} />
      <HapticsSection viewModel={viewModel} />
      <AboutSection viewModel={viewModel} />
      <AccountSection viewModel={viewModel} />
    </ScrollView>
  );
}
