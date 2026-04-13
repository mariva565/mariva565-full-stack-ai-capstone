import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text as RNText, View, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "../../lib/colors";

type TabIconProps = {
  name: "book" | "heart" | "team" | "user";
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
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.brandDeep },
        headerTintColor: COLORS.textOnBrand,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => router.push("/chat")} 
            style={{ marginRight: 12, width: 44, height: 44, justifyContent: "center", alignItems: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Open AI Chatbot"
          >
            <Image 
              source={require("../../assets/branding/AI-icon-1.png")} 
              style={{ width: 48, height: 48, transform: [{ scale: 1.4 }] }} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        ),
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
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="team" focused={focused} />,
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
