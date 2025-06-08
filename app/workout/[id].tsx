import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function WorkoutDetailScreen() {
  const { id, log_id } = useLocalSearchParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();
      if (workoutError) throw workoutError;
      setWorkout(workoutData);
      // Fetch exercises for this workout
      const { data: workoutExercises, error: weError } = await supabase
        .from('workout_exercises')
        .select('*, exercise:exercise_id(*)')
        .eq('workout_id', id)
        .order('sequence', { ascending: true });
      if (weError) throw weError;
      setExercises(workoutExercises || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading workout');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchWorkout();
    setRefreshing(false);
  }, []);

  const handleMarkComplete = async () => {
    if (!user) return;
    setMarkingComplete(true);
    try {
      const { error } = await supabase.from('workout_logs').insert({
        user_id: user.id,
        workout_id: id,
        completed_at: new Date().toISOString(),
        notes: completionNotes,
      });
      if (error) throw error;
      setCompleteModalVisible(false);
      setCompletionNotes('');
      Alert.alert('Workout marked as complete!', undefined, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not log workout');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleDeleteActivity = async () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!log_id) return;
            try {
              const { error } = await supabase
                .from('workout_logs')
                .delete()
                .eq('id', log_id);
              if (error) throw error;
              Alert.alert('Activity deleted');
              // Go back to activity tab with a backward swipe
              router.back();
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Could not delete activity');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </SafeAreaView>
    );
  }
  if (error || !workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>{error || 'Workout not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ChevronLeft size={28} color="#1E88E5" strokeWidth={2} />
          <Text style={styles.backText}>Back</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.description}>{workout.description}</Text>
      {workout.instructions && (
        <Text style={styles.instructions}>{workout.instructions}</Text>
      )}
      {workout.tags && (
        <View style={styles.tagRow}>
          {workout.tags.map((tag: string) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.sectionTitle}>Exercises</Text>
    </>
  );

  const renderFooter = () => {
    if (log_id) {
      return (
        <TouchableOpacity style={styles.startBtn} onPress={handleDeleteActivity}>
          <Text style={styles.startBtnText}>Delete Activity</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.startBtn} onPress={() => setCompleteModalVisible(true)}>
        <Text style={styles.startBtnText}>Mark as Complete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={exercises}
        keyExtractor={item => item.exercise.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E88E5']}
            tintColor="#1E88E5"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            {item.exercise.media_type === 'video' ? (
              <WebView
                source={{
                  html: `
                    <video 
                      src='${item.exercise.media_url}' 
                      controls 
                      style='width:100%;height:100%;object-fit:cover;'
                      poster='${item.exercise.thumbnail_url || ''}'
                    ></video>
                  `
                }}
                style={styles.exerciseImage}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
              <Image
                source={{ uri: item.exercise.media_url }}
                style={styles.exerciseImage}
              />
            )}
            <View style={styles.exerciseContent}>
              <Text style={styles.exerciseName}>{item.exercise.name}</Text>
              {item.instructions ? (
                <Text style={styles.exerciseInstructions}>{item.instructions}</Text>
              ) : null}
            </View>
          </View>
        )}
      />
      <Modal
        visible={completeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Workout Notes (optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={completionNotes}
                onChangeText={setCompletionNotes}
                placeholder="How did it go? Any notes?"
                multiline
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <TouchableOpacity onPress={() => setCompleteModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMarkComplete} style={styles.modalSaveBtn} disabled={markingComplete}>
                  <Text style={styles.modalSaveText}>{markingComplete ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: { 
    flexGrow: 1, 
    backgroundColor: '#FFFFFF',
    paddingBottom: 32,
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
  backText: { color: '#1E88E5', fontWeight: '400', fontSize: 17, marginLeft: 2 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3748', marginHorizontal: 24, marginBottom: 8 },
  description: { fontSize: 16, color: '#718096', marginHorizontal: 24, marginBottom: 8 },
  instructions: { fontSize: 14, color: '#4A5568', marginHorizontal: 24, marginBottom: 8, fontStyle: 'italic' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 24, marginBottom: 16 },
  tagPill: { backgroundColor: '#EBF8FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 4 },
  tagText: { fontSize: 12, color: '#1E88E5' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#2D3748', marginHorizontal: 24, marginBottom: 12, marginTop: 16 },
  exerciseCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2, 
    marginHorizontal: 24, 
    marginBottom: 16 
  },
  exerciseImage: { 
    width: '100%', 
    height: 200 
  },
  exerciseContent: { 
    padding: 16 
  },
  exerciseName: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#2D3748', 
    marginBottom: 8 
  },
  exerciseInstructions: {
    fontSize: 15,
    color: '#1E88E5',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  startBtn: { backgroundColor: '#1E88E5', borderRadius: 12, padding: 16, alignItems: 'center', margin: 24, marginTop: 32 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2D3748',
  },
  modalInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalCancelBtn: {
    padding: 12,
  },
  modalCancelText: {
    color: '#E53E3E',
    fontWeight: '600',
    fontSize: 16,
  },
  modalSaveBtn: {
    backgroundColor: '#1E88E5',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 