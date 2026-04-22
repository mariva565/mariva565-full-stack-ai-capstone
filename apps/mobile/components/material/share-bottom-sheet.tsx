import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "../../lib/app-preferences";
import {
  fetchSharedWithRecipients,
  shareMaterial,
  unshareMaterial,
  invalidateSharedWithRecipients,
  invalidateSharedByMe,
  type SharedWithRecipient,
} from "../../lib/share";
import { queryKeys } from "../../lib/query-keys";
import { getUserFriendlyError } from "../../lib/api";
import { useToast } from "../../lib/toast-context";

type ShareBottomSheetProps = {
  materialId: number;
  visible: boolean;
  onClose: () => void;
};

export function ShareBottomSheet({ materialId, visible, onClose }: ShareBottomSheetProps) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const sharedWithQuery = useQuery({
    queryKey: queryKeys.sharedMaterials.sharedWith(materialId),
    queryFn: () => fetchSharedWithRecipients(materialId),
    enabled: visible,
  });

  const shareMutation = useMutation({
    mutationFn: (targetEmail: string) => shareMaterial(materialId, targetEmail),
    onSuccess: () => {
      showToast("Access granted + invitation sent!", "success");
      setEmail("");
      void invalidateSharedWithRecipients(queryClient, materialId);
      void invalidateSharedByMe(queryClient);
    },
    onError: (error) => {
      showToast(getUserFriendlyError(error, "Could not share material"), "error");
    },
  });

  const unshareMutation = useMutation({
    mutationFn: (recipientId: number) => unshareMaterial(materialId, recipientId),
    onSuccess: () => {
      showToast("Access revoked.", "success");
      void invalidateSharedWithRecipients(queryClient, materialId);
      void invalidateSharedByMe(queryClient);
    },
    onError: (error) => {
      showToast(getUserFriendlyError(error, "Could not unshare material"), "error");
    },
  });

  const handleShare = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    shareMutation.mutate(trimmed);
  };

  const sharedWith = sharedWithQuery.data ?? [];
  const loading = sharedWithQuery.isPending;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandleWrap}>
              <View style={[styles.dragHandle, { backgroundColor: colors.borderSubtle }]} />
            </View>

            <Text style={[styles.title, { color: colors.titlePrimary }]} maxFontSizeMultiplier={1.2}>
              Share Material
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              Give someone access to this note. They will see it in their Quick Access shelf.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.borderSubtle,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Enter email address..."
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.brandPrimary },
                  (shareMutation.isPending || !email.trim()) && { opacity: 0.5 },
                ]}
                onPress={handleShare}
                disabled={shareMutation.isPending || !email.trim()}
              >
                {shareMutation.isPending ? (
                  <ActivityIndicator color={colors.textOnBrand} size="small" />
                ) : (
                  <Text style={[styles.submitBtnText, { color: colors.textOnBrand }]}>Share</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              People with access
            </Text>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {loading ? (
                <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 20 }} />
              ) : sharedWith.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  This material is not shared with anyone yet.
                </Text>
              ) : (
                sharedWith.map((user: SharedWithRecipient) => (
                  <View key={user.id} style={styles.userRow}>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.textPrimary }]}>
                        {user.name || user.email}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                        {user.name ? user.email : "Shared user"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.unshareBtn, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerSoft }]}
                      onPress={() => unshareMutation.mutate(user.id)}
                      disabled={unshareMutation.isPending}
                    >
                      <Text style={[styles.unshareBtnText, { color: colors.dangerText }]}>
                        Unshare
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
            
            <View style={{ height: 30 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: "80%",
    minHeight: 400,
  },
  dragHandleWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  submitBtnText: {
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  userInfo: {
    flex: 1,
    paddingRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  unshareBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unshareBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
