import { useEffect, useRef } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

type QrScannerScreenProps = {
  visible: boolean;
  onClose: () => void;
};

const QR_PREFIX = "studyhub-handoff:";

export function QrScannerScreen({ visible, onClose }: QrScannerScreenProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  // Reset scan guard each time the modal opens
  useEffect(() => {
    if (visible) {
      scannedRef.current = false;
    }
  }, [visible]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    if (!data.startsWith(QR_PREFIX)) return;

    const rawId = data.slice(QR_PREFIX.length);
    if (!/^\d+$/.test(rawId)) return;

    scannedRef.current = true;
    onClose();
    router.push(`/(tabs)/profile?handoffUserId=${rawId}` as never);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {!permission?.granted ? (
          <View style={styles.permBox}>
            <Text style={styles.permTitle}>Camera access needed</Text>
            <Text style={styles.permBody}>
              Allow camera access to scan StudyHub QR codes and start
              conversations.
            </Text>
            <TouchableOpacity
              style={styles.allowBtn}
              onPress={requestPermission}
              accessibilityRole="button"
              accessibilityLabel="Allow camera access"
            >
              <Text style={styles.allowBtnText}>Allow Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel QR scanner"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            {/* Dark overlay with cutout hint */}
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.cutout} />
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.hint}>
                Point at a StudyHub QR code to start a conversation
              </Text>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close QR scanner"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const CUTOUT = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // Permission screen
  permBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  permTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  permBody: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  allowBtn: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  allowBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  // Camera overlay
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: CUTOUT,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  cutout: {
    width: CUTOUT,
    height: CUTOUT,
    borderWidth: 2,
    borderColor: "#a78bfa",
    borderRadius: 16,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 28,
    gap: 20,
  },
  hint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  // Shared cancel button
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
