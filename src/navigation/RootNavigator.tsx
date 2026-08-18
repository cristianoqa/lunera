import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import CycleSetupScreen from "../screens/onboarding/CycleSetupScreen";
import GoalsScreen from "../screens/onboarding/GoalsScreen";
import AuthScreen, { isOnboardingDone, loadStoredProfile } from "../screens/auth/AuthScreen";
import MainTabs from "./MainTabs";
import AiChatScreen from "../screens/ai/AiChatScreen";
import AppLockGate from "../components/AppLockGate";
import { useAppStore } from "../store/appStore";
import { useAppTheme } from "../theme/AppThemeProvider";

const Stack = createNativeStackNavigator();

function BootSplash() {
  const colors = useAppTheme();
  return (
    <View style={[styles.splash, { backgroundColor: colors.bgLinen }]}>
      <Image source={require("../../assets/splash-icon.png")} style={styles.logo} accessibilityLabel="Lunera" />
    </View>
  );
}

export default function RootNavigator() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<"Onboarding" | "Main">("Onboarding");
  const setProfile = useAppStore((s) => s.setProfile);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    (async () => {
      const done = await isOnboardingDone();
      if (done) {
        const profile = await loadStoredProfile();
        if (profile) {
          setProfile(profile);
          await hydrate(profile.id);
          setInitialRoute("Main");
        } else {
          setInitialRoute("Onboarding");
        }
      }
      setReady(true);
    })();
  }, [setProfile, hydrate]);

  if (!ready) return <BootSplash />;

  return (
    <AppLockGate>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.bgLinen },
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "700", color: colors.text },
            contentStyle: { backgroundColor: colors.bgLinen },
          }}
        >
          <Stack.Screen name="Onboarding" component={WelcomeScreen} />
          <Stack.Screen name="CycleSetup" component={CycleSetupScreen} options={{ headerShown: true, title: "Lunera" }} />
          <Stack.Screen name="Goals" component={GoalsScreen} options={{ headerShown: true, title: "Lunera" }} />
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: true, title: "Lunera" }} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="AiChat"
            component={AiChatScreen}
            options={{
              headerShown: true,
              title: t("ai_chat_title"),
              presentation: "card",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppLockGate>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 112, height: 112, borderRadius: 28 },
});
