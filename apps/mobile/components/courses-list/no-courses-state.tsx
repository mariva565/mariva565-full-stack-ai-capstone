import { Image, Text, View } from "react-native";
import type { CoursesListStyles } from "./courses-list.styles";

export function NoCoursesState({ styles }: { styles: CoursesListStyles }) {
  return (
    <View style={styles.noCoursesWrap}>
      <View style={styles.noCoursesCard}>
        <Image
          source={require("../../assets/branding/mascot.png")}
          style={styles.noCoursesMascot}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.noCoursesTitle} maxFontSizeMultiplier={1.2}>
          Study<Text style={styles.brandTitleAccent}>Hub</Text>
        </Text>
        <Text style={styles.noCoursesHeading} maxFontSizeMultiplier={1.2}>
          No courses yet
        </Text>
        <Text style={styles.noCoursesSubtitle} maxFontSizeMultiplier={1.2}>
          Tap + to create your first course.
        </Text>
      </View>
    </View>
  );
}
