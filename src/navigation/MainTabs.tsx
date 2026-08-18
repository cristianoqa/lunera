import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import HomeScreen from "../screens/dashboard/HomeScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import LogScreen from "../screens/log/LogScreen";
import InsightsScreen from "../screens/analytics/InsightsScreen";
import LearnScreen from "../screens/learn/LearnScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import AboutScreen from "../screens/settings/AboutScreen";
import SupportScreen from "../screens/settings/SupportScreen";
import PremiumScreen from "../screens/premium/PremiumScreen";
import ProfileScreen from "../screens/settings/ProfileScreen";
import AccountScreen from "../screens/settings/AccountScreen";
import CustomizeIconsScreen from "../screens/settings/CustomizeIconsScreen";
import LifeModeScreen from "../screens/settings/LifeModeScreen";
import PremiumTabBar from "./PremiumTabBar";
import { useAppTheme } from "../theme/AppThemeProvider";

const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();

function SettingsStackScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLinen },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        contentStyle: { backgroundColor: colors.bgLinen },
      }}
    >
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: t("tab_settings") }} />
      <SettingsStack.Screen name="About" component={AboutScreen} options={{ title: t("about_title") }} />
      <SettingsStack.Screen name="Support" component={SupportScreen} options={{ title: t("support_title") }} />
      <SettingsStack.Screen name="Premium" component={PremiumScreen} options={{ title: t("premium_title") }} />
      <SettingsStack.Screen name="Profile" component={ProfileScreen} options={{ title: t("profile_title") }} />
      <SettingsStack.Screen name="Account" component={AccountScreen} options={{ title: t("settings_login_sync") }} />
      <SettingsStack.Screen
        name="CustomizeIcons"
        component={CustomizeIconsScreen}
        options={{ title: t("emoji_customize_title") }}
      />
      <SettingsStack.Screen
        name="LifeMode"
        component={LifeModeScreen}
        options={{ title: t("life_mode_title") }}
      />
    </SettingsStack.Navigator>
  );
}

export default function MainTabs() {
  const { t } = useTranslation();
  const colors = useAppTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <PremiumTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLinen },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        sceneStyle: { backgroundColor: colors.bgLinen },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: t("tab_home"), headerShown: false }} />
      <Tab.Screen name="CalendarTab" component={CalendarScreen} options={{ title: t("tab_calendar") }} />
      <Tab.Screen name="LogTab" component={LogScreen} options={{ title: t("tab_log") }} />
      <Tab.Screen name="InsightsTab" component={InsightsScreen} options={{ title: t("tab_insights") }} />
      <Tab.Screen name="LearnTab" component={LearnScreen} options={{ title: t("tab_learn") }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackScreen} options={{ title: t("tab_settings"), headerShown: false }} />
    </Tab.Navigator>
  );
}
