import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutsScreen() {
  const [tab, setTab] = useState<"workouts" | "exercises">("workouts");
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (params.refresh) {
      fetchData();
    }
  }, [params.refresh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .select("*")
        .order("created_at", { ascending: false });
      if (workoutError || exerciseError) throw workoutError || exerciseError;
      setWorkouts(workoutData || []);
      setExercises(exerciseData || []);
    } catch (err) {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Custom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, tab === "workouts" && styles.activeTab]}
            onPress={() => setTab("workouts")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "workouts" && styles.activeTabText,
              ]}
            >
              Workouts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === "exercises" && styles.activeTab]}
            onPress={() => setTab("exercises")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "exercises" && styles.activeTabText,
              ]}
            >
              Exercises
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === "workouts" ? (
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1E88E5"]}
                tintColor="#1E88E5"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.workoutCard}
                onPress={() =>
                  router.push({
                    pathname: "/workout/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutDescription}>
                  {item.description}
                </Text>
                {item.tags && (
                  <View style={styles.tagRow}>
                    {item.tags.map((tag: string) => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1E88E5"]}
                tintColor="#1E88E5"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseCard}
                onPress={() =>
                  router.push({
                    pathname: "/exercise/[id]",
                    params: { id: item.id },
                  })
                }
              >
                {item.media_type === "video" ? (
                  <VideoPlayerWrapper uri={item.media_url} />
                ) : null}
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseEquipment}>
                      {item.equipment}
                    </Text>
                    <Text style={styles.exerciseDifficulty}>
                      {item.difficulty}
                    </Text>
                  </View>
                  <View style={styles.muscleGroupsContainer}>
                    {(item.muscle_groups || []).map((muscle: string) => (
                      <View key={muscle} style={styles.muscleGroupPill}>
                        <Text style={styles.muscleGroupText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
const VideoPlayerWrapper = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, (player) => {});

  return (
    <VideoView
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      style={{ width: "100%", height: 200 }} // adjust as needed
    />
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    marginHorizontal: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#1E88E5",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#718096",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  workoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#1E88E5",
  },
  exerciseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  exerciseImage: {
    width: "100%",
    height: 200,
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  exerciseEquipment: {
    fontSize: 14,
    color: "#718096",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseDifficulty: {
    fontSize: 14,
    color: "#718096",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleGroupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  muscleGroupPill: {
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleGroupText: {
    fontSize: 12,
    color: "#1E88E5",
  },
});
