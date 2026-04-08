import { Tabs } from "expo-router";
import { StyleSheet, Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "../../lib/colors";

type TabIconProps = {
  name: "book" | "user";
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <AntDesign
        name={name}
        size={18}
        color={focused ? COLORS.brandPrimary : COLORS.textMuted}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.brandDeep },
        headerTintColor: COLORS.textOnBrand,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.violetSoft,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarActiveTintColor: COLORS.brandPrimary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Courses",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="book" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  iconWrapActive: {
    opacity: 1,
  },
});
