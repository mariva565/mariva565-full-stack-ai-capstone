import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { useTheme } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";

type ProfileQrCardProps = {
  userId: number;
};

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 14,
      paddingVertical: 20,
      paddingHorizontal: 20,
      alignItems: "center",
      shadowColor: colors.brandDeep,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    title: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 16,
    },
    qrWrap: {
      padding: 14,
      backgroundColor: "#ffffff",
      borderRadius: 12,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 14,
      textAlign: "center",
      maxWidth: 220,
      lineHeight: 17,
    },
  });
}

export function ProfileQrCard({ userId }: ProfileQrCardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>My QR Code</Text>
      <View style={styles.qrWrap}>
        <QRCode value={`studyhub-handoff:${userId}`} size={160} />
      </View>
      <Text style={styles.subtitle}>
        Others can scan this to start a direct conversation with you
      </Text>
    </View>
  );
}
