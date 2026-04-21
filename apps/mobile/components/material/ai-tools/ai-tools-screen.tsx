import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../../lib/app-preferences";
import { useAiTools } from "./use-ai-tools";
import { AiToolRenderer } from "./ai-tool-renderer";
import type { ToolName } from "../../../lib/studyhub-types";
import { RequestState } from "../../request-state";

const TOOLS: { name: ToolName; label: string; icon: string }[] = [
  { name: "summarize", label: "Summarize", icon: "📝" },
  { name: "flashcards", label: "Flashcards", icon: "🗂" },
  { name: "quiz", label: "Quiz", icon: "❓" },
  { name: "definitions", label: "Definitions", icon: "📖" },
];

export function AiToolsScreen({ materialId }: { materialId: number }) {
  const { colors } = useTheme();
  const {
    material,
    savedOutputs,
    loadingInitial,
    activeResult,
    setActiveResult,
    generateTool,
    isGenerating,
    saveActiveResult,
    isSaving,
  } = useAiTools(materialId);

  if (loadingInitial) {
    return (
      <View style={[styles.center, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  if (!material) {
    return (
      <RequestState
        icon="Error"
        title="Not found"
        subtitle="Could not find material."
      />
    );
  }

  const hasContent = (material.content?.trim()?.length ?? 0) > 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvas }]} contentContainerStyle={styles.content}>
      
      {/* Generate Section */}
      <Text style={[styles.sectionTitle, { color: colors.titlePrimary }]}>GENERATE NEW</Text>
      {!hasContent ? (
        <Text style={[styles.warningText, { color: colors.textMuted }]}>
          Add text content to this material to generate AI results.
        </Text>
      ) : null}

      <View style={styles.grid}>
        {TOOLS.map((t) => (
          <TouchableOpacity
            key={t.name}
            style={[
              styles.toolBtn,
              { backgroundColor: colors.surface, borderColor: colors.borderMuted },
              isGenerating && styles.disabled,
            ]}
            disabled={isGenerating || !hasContent}
            activeOpacity={0.7}
            onPress={() => generateTool(t.name)}
          >
            <Text style={styles.toolIcon}>{t.icon}</Text>
            <Text style={[styles.toolLabel, { color: colors.brandPrimary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isGenerating ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.brandPrimary} />
          <Text style={[styles.loadingTxt, { color: colors.textSecondary }]}>Analyzing content...</Text>
        </View>
      ) : null}

      {/* Active Result */}
      {activeResult && !isGenerating ? (
        <View style={[styles.activeBox, { borderColor: colors.brandPrimary, backgroundColor: colors.surface }]}>
          <View style={styles.activeHeader}>
            <Text style={[styles.activeHeaderTxt, { color: colors.textSecondary }]}>PREVIEW</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveResult(null)}>
              <Text style={{ color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <AiToolRenderer result={activeResult} />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }, isSaving && styles.disabled]}
            disabled={isSaving}
            onPress={saveActiveResult}
          >
            <Text style={styles.saveBtnTxt}>{isSaving ? "Saving..." : "Save Result"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Saved Outputs List */}
      <Text style={[styles.sectionTitle, { color: colors.titlePrimary, marginTop: 32 }]}>SAVED RESULTS</Text>
      
      {savedOutputs.length === 0 ? (
        <Text style={[styles.warningText, { color: colors.textMuted }]}>
          No saved AI results for this material yet.
        </Text>
      ) : (
        <View style={styles.savedList}>
          {savedOutputs.map((out) => (
            <View key={out.id} style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.borderMuted }]}>
              <View style={styles.savedCardHeader}>
                <Text style={[styles.savedCardLabel, { color: colors.titlePrimary }]}>
                  {TOOLS.find(x => x.name === out.tool)?.label ?? "AI Result"}
                </Text>
              </View>
              <Text style={[styles.savedDate, { color: colors.textMuted }]}>
                {new Date(out.createdAt).toLocaleString()}
              </Text>
              
              <View style={styles.savedContent}>
                <AiToolRenderer result={out} />
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  toolBtn: {
    flexBasis: "48%",
    flexGrow: 1,
    flexShrink: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  loadingBox: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingTxt: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeHeaderTxt: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
  },
  saveBtn: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  savedList: {
    gap: 16,
  },
  savedCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  savedCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  savedCardLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  delBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  delBtnTxt: {
    fontSize: 12,
    fontWeight: "700",
  },
  savedDate: {
    fontSize: 12,
  },
  savedContent: {
    marginTop: 8,
  },
  spacer: {
    height: 40,
  },
});
