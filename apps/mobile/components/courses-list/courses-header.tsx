import { Image, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { CoursesListStyles } from "./courses-list.styles";

interface CoursesHeaderProps {
  userName: string;
  coursesCount: number;
  modulesCount: number;
  materialsCount: number;
  styles: CoursesListStyles;
  heroGradient: readonly [string, string];
  onChat: () => void;
}

export function CoursesHeader({
  userName,
  coursesCount,
  modulesCount,
  materialsCount,
  styles,
  heroGradient,
  onChat,
}: CoursesHeaderProps) {
  return (
    <LinearGradient
      colors={heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.brandRowContainer}>
          <View style={styles.brandUnit}>
            <Image
              source={require("../../assets/branding/mascot.png")}
              style={styles.brandMascot}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.brandTitle}>
              Study<Text style={styles.brandTitleAccent}>Hub</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.aiChatButton}
            onPress={onChat}
            accessibilityRole="button"
            accessibilityLabel="Open AI Chatbot"
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/branding/AI-icon-1.png")}
              style={styles.aiChatIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.brandSubtitle} maxFontSizeMultiplier={1.2}>
          Learn smarter, every day.
        </Text>

        <View style={styles.greetingRow}>
          <Text style={styles.headerGreeting} maxFontSizeMultiplier={1.2}>
            Welcome back,
          </Text>
          <Text style={styles.headerName} maxFontSizeMultiplier={1.3}>
            {userName}!
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
            {coursesCount}
          </Text>
          <Text style={styles.statLabel} maxFontSizeMultiplier={1.2}>
            {coursesCount === 1 ? "Course" : "Courses"}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
            {modulesCount}
          </Text>
          <Text style={styles.statLabel} maxFontSizeMultiplier={1.2}>
            {modulesCount === 1 ? "Module" : "Modules"}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber} maxFontSizeMultiplier={1.3}>
            {materialsCount}
          </Text>
          <Text style={styles.statLabel} maxFontSizeMultiplier={1.2}>
            {materialsCount === 1 ? "Material" : "Materials"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
