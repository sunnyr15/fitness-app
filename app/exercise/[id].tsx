import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setExercise(data);
    } catch (err) {
      setError('Error loading exercise');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchExercise();
    setRefreshing(false);
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </SafeAreaView>
    );
  }
  if (error || !exercise) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>{error || 'Exercise not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E88E5']}
            tintColor="#1E88E5"
          />
        }
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ChevronLeft size={28} color="#1E88E5" strokeWidth={2} />
            <Text style={{ color: '#1E88E5', fontWeight: '400', fontSize: 17, marginLeft: 2 }}>Back</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{exercise.name}</Text>
        {exercise.media_type === 'video' ? (
          <WebView
            source={{
              html: `
                <video 
                  src='${exercise.media_url}' 
                  controls 
                  style='width:100%;height:100%;object-fit:cover;'
                  poster='${exercise.thumbnail_url || ''}'
                ></video>
              `
            }}
            style={styles.exerciseImage}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <Image
            source={{ uri: exercise.media_url }}
            style={styles.exerciseImage}
          />
        )}
        <View style={styles.exerciseContent}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{exercise.description}</Text>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagRow}>
            {(exercise.tags || []).map((tag: string) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Muscle Groups</Text>
          <View style={styles.muscleGroupsContainer}>
            {(exercise.muscle_groups || []).map((muscle: string) => (
              <View key={muscle} style={styles.muscleGroupPill}>
                <Text style={styles.muscleGroupText}>{muscle}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <Text style={styles.equipment}>{exercise.equipment}</Text>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <Text style={styles.difficulty}>{exercise.difficulty}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backBtn: { 
    margin: 24,
    marginTop: 0, // Remove top margin since SafeAreaView handles it
  },
  backText: { color: '#1E88E5', fontWeight: '600', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3748', marginHorizontal: 24, marginBottom: 8 },
  exerciseImage: { width: '100%', height: 200 },
  exerciseContent: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginTop: 16, marginBottom: 8 },
  description: { fontSize: 16, color: '#718096', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tagPill: { backgroundColor: '#EBF8FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 4 },
  tagText: { fontSize: 12, color: '#1E88E5' },
  muscleGroupsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  muscleGroupPill: { backgroundColor: '#EBF8FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 4 },
  muscleGroupText: { fontSize: 12, color: '#1E88E5' },
  equipment: { fontSize: 16, color: '#718096', marginBottom: 8 },
  difficulty: { fontSize: 16, color: '#718096', marginBottom: 8 },
}); 