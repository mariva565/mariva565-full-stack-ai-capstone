import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { getMaterialTypeConfig, splitTags } from "../../lib/material-utils";
import { NetworkBanner } from "../../components/network-banner";
import { RequestState } from "../../components/request-state";
import { MaterialScreenSkeleton } from "../../components/material/material-screen-skeleton";
import { makeMaterialScreenStyles } from "../../components/material/material-screen.styles";
import { useMaterialScreen } from "../../components/material/use-material-screen";

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeMaterialScreenStyles);
  const heroGradient = [colors.brandDeep, colors.brandPrimary] as const;

  const {
    material,
    loading,
    refreshing,
    error,
    offline,
    isPinned,
    toggleFavoriteBusy,
    openMaterialUrl,
    toggleFavorite,
    refresh,
  } = useMaterialScreen(routeId);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <MaterialScreenSkeleton />
      </>
    );
  }

  if (error || !material) {
    return (
      <>
        <Stack.Screen options={{ title: "Error" }} />
        <RequestState
          icon={offline ? "Offline" : "Error"}
          title={offline ? "You are offline" : "Could not load material"}
          subtitle={offline ? "Reconnect to load this material." : error || "Material not found"}
          actionLabel="Retry"
          onAction={refresh}
          accessibilityLabel={
            offline ? "Retry loading material while offline" : "Retry loading material"
          }
        />
      </>
    );
  }

  const cfg = getMaterialTypeConfig(material.materialType, colors);
  const tags = splitTags(material.tags);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.brandPrimary}
        />
      }
    >
      <Stack.Screen options={{ title: material.title }} />

      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.typeBadgeText, { color: cfg.color }]} maxFontSizeMultiplier={1.2}>
            {cfg.label}
          </Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.3}>{material.title}</Text>
        <Text style={styles.heroDate} maxFontSizeMultiplier={1.2}>
          {new Date(material.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.pinBtn, isPinned ? styles.pinBtnDanger : styles.pinBtnNeutral]}
          onPress={() => {
            void toggleFavorite();
          }}
          disabled={toggleFavoriteBusy}
          accessibilityRole="button"
          accessibilityLabel={
            isPinned ? "Unpin material from favorites" : "Pin material to favorites"
          }
          accessibilityHint="Toggles quick access state in Favorites tab"
        >
          <Text style={styles.pinBtnText} maxFontSizeMultiplier={1.2}>
            {toggleFavoriteBusy
              ? "Updating..."
              : isPinned
                ? "Unpin from Favorites"
                : "Pin to Favorites"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {offline ? (
        <View style={styles.offlineBannerWrap}>
          <NetworkBanner message="Showing last synced material data until connection is restored." />
        </View>
      ) : null}

      <View style={styles.contentCard}>
        {material.content ? (
          <Text style={styles.contentText}>{material.content}</Text>
        ) : (
          <Text style={styles.noContent}>No content</Text>
        )}
      </View>

      {material.fileUrl ? (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => {
            void openMaterialUrl();
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            material.materialType === "link" ? "Open material link" : "Open material file"
          }
          accessibilityHint="Opens the URL with your device browser or file handler"
        >
          <Text style={styles.linkLabel} maxFontSizeMultiplier={1.2}>
            {material.materialType === "link" ? "Open Link" : "Open File"}
          </Text>
          <Text style={styles.linkUrl} numberOfLines={2} maxFontSizeMultiplier={1.2}>
            {material.fileUrl}
          </Text>
        </TouchableOpacity>
      ) : null}

      {material.content ? (
        <TouchableOpacity
          style={styles.aiToolsBtn}
          onPress={() => router.push(`/material/${material.id}/ai-tools`)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open AI Study Tools"
        >
          <Text style={styles.aiToolsBtnText} maxFontSizeMultiplier={1.2}>
            🧪 AI Study Tools
          </Text>
        </TouchableOpacity>
      ) : null}

      {tags.length > 0 ? (
        <View style={styles.tagsCard}>
          <Text style={styles.tagsLabel} maxFontSizeMultiplier={1.2}>Tags</Text>
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} maxFontSizeMultiplier={1.2}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
