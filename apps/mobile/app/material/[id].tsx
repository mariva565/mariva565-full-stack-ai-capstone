import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import {
  getMaterialTypeConfig,
  isWordFileUrl,
  normalizeMaterialType,
  splitTags,
} from "../../lib/material-utils";
import { NetworkBanner } from "../../components/network-banner";
import { RequestState } from "../../components/request-state";
import { MaterialScreenSkeleton } from "../../components/material/material-screen-skeleton";
import { makeMaterialScreenStyles } from "../../components/material/material-screen.styles";
import { useMaterialScreen } from "../../components/material/use-material-screen";
import { ShareBottomSheet } from "../../components/material/share-bottom-sheet";
import { DetailBackButton } from "../../components/detail-back-button";

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeMaterialScreenStyles);
  const heroGradient = [colors.brandDeep, colors.brandPrimary] as const;
  const [showShareSheet, setShowShareSheet] = useState(false);

  const {
    material,
    loading,
    refreshing,
    error,
    offline,
    isPinned,
    moduleInfo,
    toggleFavoriteBusy,
    openMaterialBusy,
    extractingText,
    filePreviewUrl,
    filePreviewLoading,
    openMaterialUrl,
    toggleFavorite,
    extractText,
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
  const isFileMaterial = normalizeMaterialType(material.materialType) === "file";
  const isWordFile = isWordFileUrl(material.fileUrl);
  const openLabel = isFileMaterial
    ? openMaterialBusy
      ? "Preparing File..."
      : isWordFile
        ? "Download File"
        : "Open File"
    : "Open Link";

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
      {moduleInfo ? (
        <DetailBackButton
          label="Back to module"
          onPress={() =>
            router.push({ pathname: "/module/[id]", params: { id: moduleInfo.id } })
          }
        />
      ) : null}

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
        <View style={styles.heroActions}>
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
            accessibilityHint="Toggles quick access state in My Shelf tab"
          >
            <Text style={styles.pinBtnText} maxFontSizeMultiplier={1.2}>
              {toggleFavoriteBusy
                ? "Updating..."
                : isPinned
                  ? "Unpin from Shelf"
                  : "Pin to Shelf"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => setShowShareSheet(true)}
            accessibilityRole="button"
            accessibilityLabel="Share material"
            accessibilityHint="Opens share settings"
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8 12v7a1 1 0 001 1h6a1 1 0 001-1v-7"
                stroke={colors.textOnBrand}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 15V3M8 7l4-4 4 4"
                stroke={colors.textOnBrand}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.shareBtnText} maxFontSizeMultiplier={1.2}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ShareBottomSheet 
        visible={showShareSheet} 
        onClose={() => setShowShareSheet(false)} 
        materialId={Number(routeId)} 
      />

      {offline ? (
        <View style={styles.offlineBannerWrap}>
          <NetworkBanner message="Showing last synced material data until connection is restored." />
        </View>
      ) : null}

      <View style={styles.contentCard}>
        {material.content ? (
          <Text style={styles.contentText}>{material.content}</Text>
        ) : /\.(pdf|docx?)$/i.test(material.fileUrl ?? "") ? (
          <TouchableOpacity
            style={styles.extractBtn}
            onPress={() => void extractText()}
            disabled={extractingText}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Extract text from file and convert to note"
          >
            {extractingText ? (
              <ActivityIndicator size="small" color={colors.textOnBrand} />
            ) : (
              <Text style={styles.extractBtnIcon}>📄</Text>
            )}
            <Text style={styles.extractBtnText} maxFontSizeMultiplier={1.2}>
              {extractingText ? "Extracting..." : "Extract text from file"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noContent}>No content</Text>
        )}
      </View>

      {filePreviewLoading ? (
        <View style={styles.filePreviewCard}>
          <ActivityIndicator size="small" color={colors.link} />
          <Text style={styles.filePreviewLoadingText}>Loading preview...</Text>
        </View>
      ) : null}

      {filePreviewUrl ? (
        <View style={styles.filePreviewCard}>
          <Image
            source={{ uri: filePreviewUrl }}
            resizeMode="contain"
            style={styles.filePreviewImage}
            accessibilityLabel={`${material.title} image preview`}
          />
        </View>
      ) : null}

      {material.fileUrl ? (
        <TouchableOpacity
          style={[styles.linkCard, openMaterialBusy ? styles.linkCardDisabled : null]}
          onPress={() => {
            void openMaterialUrl();
          }}
          disabled={openMaterialBusy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            isFileMaterial && isWordFile
              ? "Download material file"
              : isFileMaterial
                ? "Open material file"
                : "Open material link"
          }
          accessibilityHint="Opens the URL with your device browser or file handler"
        >
          <View style={styles.linkLabelRow}>
            <Text style={styles.linkLabel} maxFontSizeMultiplier={1.2}>
              {openLabel}
            </Text>
            {openMaterialBusy ? (
              <ActivityIndicator size="small" color={colors.link} />
            ) : null}
          </View>
          <Text style={styles.linkUrl} numberOfLines={2} maxFontSizeMultiplier={1.2}>
            {isFileMaterial ? "Protected file attachment" : material.fileUrl}
          </Text>
        </TouchableOpacity>
      ) : null}

      {material.content || /\.(pdf|docx?)$/i.test(material.fileUrl ?? "") ? (
        <TouchableOpacity
          style={styles.aiToolsBtn}
          onPress={() => router.push(`/material/${material.id}/ai-tools`)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open AI Study Tools"
        >
          <Text style={styles.aiToolsBtnText} maxFontSizeMultiplier={1.2}>
            AI Study Tools
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
