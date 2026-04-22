import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/app-preferences";
import { useMessagesInbox } from "../../components/messages/use-messages-inbox";
import { useAuth } from "../../lib/auth-context";

type TabIconProps = {
  name: "book" | "heart" | "team" | "user";
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
};

function TabIcon({ name, focused, activeColor, inactiveColor }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <AntDesign
        name={name}
        size={18}
        color={focused ? activeColor : inactiveColor}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </View>
  );
}

function CoursesTabIcon({
  focused,
  activeColor,
  inactiveColor,
}: Omit<TabIconProps, "name">) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name="school-outline"
        size={19}
        color={focused ? activeColor : inactiveColor}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </View>
  );
}

function useInboxUnreadCount(): number {
  const { user } = useAuth();
  const { conversations } = useMessagesInbox();
  if (!user) return 0;
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const unreadCount = useInboxUnreadCount();

  function renderTabLabel(label: string, focused: boolean) {
    return (
      <Text
        style={[
          styles.label,
          { color: focused ? colors.brandPrimary : colors.textMuted },
        ]}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.brandDeep },
        headerTintColor: colors.textOnBrand,
        headerTitleStyle: { fontWeight: "700", color: colors.textOnBrand },
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
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.violetSoft,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Courses",
          headerShown: false,
          tabBarLabel: ({ focused }) => renderTabLabel("Courses", focused),
          tabBarIcon: ({ focused }) => (
            <CoursesTabIcon
              focused={focused}
              activeColor={colors.brandPrimary}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "My Shelf",
          headerShown: false,
          tabBarLabel: ({ focused }) => renderTabLabel("My Shelf", focused),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="heart"
              focused={focused}
              activeColor={colors.brandPrimary}
              inactiveColor={colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          headerShown: false,
          tabBarLabel: ({ focused }) => renderTabLabel("Community", focused),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="team"
              focused={focused}
              activeColor={colors.brandPrimary}
              inactiveColor={colors.textMuted}
            />
          ),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: "#ef4444", fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: ({ focused }) => renderTabLabel("Profile", focused),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="user"
              focused={focused}
              activeColor={colors.brandPrimary}
              inactiveColor={colors.textMuted}
            />
          ),
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
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
