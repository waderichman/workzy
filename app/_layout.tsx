import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootProvider } from "@/components/root-provider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#f6f3ed" },
            animation: "fade"
          }}
        />
      </RootProvider>
    </SafeAreaProvider>
  );
}
