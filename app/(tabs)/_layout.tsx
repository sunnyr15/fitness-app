import { useAuth } from "@/hooks/useAuth";
import { Tabs } from "expo-router";
import {
  Clipboard as ClipboardEdit,
  Dumbbell,
  Heart,
  Chrome as Home,
  LayoutGrid as Layout,
  User,
} from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const { isTrainer } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E88E5",
        tabBarInactiveTintColor: "#718096",
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "web" ? 0 : 16,
          left: 16,
          right: 16,
          elevation: 0,
          borderRadius: 15,
          height: 65,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Home color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => (
            <Dumbbell color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "Programs",
          tabBarIcon: ({ color }) => (
            <Layout color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => (
            <Heart color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />

      <Tabs.Screen
        name="trainer"
        options={{
          // href: isTrainer ? "trainer" : null,
          title: "Trainer",
          tabBarIcon: ({ color }) => (
            <ClipboardEdit color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <User color={color} size={24} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
