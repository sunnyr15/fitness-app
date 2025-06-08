import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditWorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Array<{
    id: string;
    name: string;
    media_url: string;
    media_type: string;
    thumbnail_url?: string;
    exercise_instructions: string;
  }>>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWorkout();
    fetchExercises();
  }, [id]);

  const fetchWorkout = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(exercise_id, instructions)')
      .eq('id', id)
      .single();
    if (!error && data) {
      setName(data.name);
      setDescription(data.description || '');
      setTags(data.tags || []);
      setInstructions(data.instructions || '');
      // Fetch exercise details for each workout_exercise
      const exerciseDetails = await Promise.all(
        data.workout_exercises.map(async (we: any) => {
          const { data: exerciseData } = await supabase
            .from('exercises')
            .select('id, name, media_url, media_type, thumbnail_url')
            .eq('id', we.exercise_id)
            .single();
          return {
            ...exerciseData,
            exercise_instructions: we.instructions || '',
          };
        })
      );
      setSelectedExercises(exerciseDetails);
    }
    setIsLoading(false);
  };

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, media_url, media_type, muscle_groups, equipment, difficulty, tags, thumbnail_url');
    if (!error) setExercises(data || []);
  };

  const handleAddExercise = (exercise: any) => {
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, {
        ...exercise,
        exercise_instructions: ''
      }]);
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== exerciseId));
  };

  const handleUpdateExerciseInstructions = (exerciseId: string, instructions: string) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.id === exerciseId ? { ...e, exercise_instructions: instructions } : e
    ));
  };

  const handleSubmit = async () => {
    if (!name || !description || selectedExercises.length === 0) {
      setError('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Update workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          name,
          description,
          tags,
          instructions,
        })
        .eq('id', id);
      if (workoutError) throw workoutError;
      // Delete existing workout_exercises
      const { error: deleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', id);
      if (deleteError) throw deleteError;
      // Insert new workout_exercises
      const workoutExercises = selectedExercises.map((e, idx) => ({
        workout_id: id,
        exercise_id: e.id,
        sequence: idx + 1,
        instructions: e.exercise_instructions,
      }));
      const { error: weError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);
      if (weError) throw weError;
      Alert.alert('Success', 'Workout updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/workouts?refresh=' + Date.now() as any) },
      ]);
    } catch (err: any) {
      setError(err.message || 'Error updating workout');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchWorkout();
    await fetchExercises();
    setRefreshing(false);
  }, []);

  // Filter exercises by search
  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      (ex.tags && ex.tags.join(',').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Workout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E88E5']}
              tintColor="#1E88E5"
            />
          }
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            <Text style={styles.label}>Workout Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter workout name"
            />
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter workout description"
              multiline
              numberOfLines={3}
            />
            <Text style={styles.label}>Tags (optional)</Text>
            <TextInput
              style={styles.input}
              value={tags.join(', ')}
              placeholder="Enter tags separated by commas"
              onChangeText={text => setTags(text.split(',').map(tag => tag.trim()))}
            />
            <Text style={styles.label}>General Instructions (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="e.g. Rest 60s between exercises"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search exercises by name or tag"
            />
            
            {selectedExercises.length > 0 && (
              <View style={styles.selectedExercises}>
                <Text style={styles.selectedTitle}>Selected Exercises</Text>
                {selectedExercises.map((exercise, index) => (
                  <View key={exercise.id} style={styles.selectedExercise}>
                    <View style={styles.selectedExerciseHeader}>
                      <Text style={styles.exerciseNumber}>{index + 1}</Text>
                      <Text style={styles.selectedExerciseName}>{exercise.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(exercise.id)}
                        style={styles.removeButton}
                      >
                        <X size={20} color="#E53E3E" />
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[styles.input, styles.exerciseInstructions]}
                      value={exercise.exercise_instructions}
                      onChangeText={(text) => handleUpdateExerciseInstructions(exercise.id, text)}
                      placeholder="Instructions (optional): e.g. 3 sets of 12 reps, 60s rest, tips, etc."
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.availableTitle}>Available Exercises</Text>
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.exerciseCard,
                    selectedExercises.find(e => e.id === item.id) && styles.selectedCard,
                  ]}
                  onPress={() => handleAddExercise(item)}
                >
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMeta}>{item.muscle_groups?.join(', ')}</Text>
                  <Text style={styles.exerciseMeta}>{item.equipment}</Text>
                  {selectedExercises.find(e => e.id === item.id) && (
                    <Text style={styles.selectedText}>Selected</Text>
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  searchInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 16,
  },
  selectedExercises: {
    marginBottom: 24,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  selectedExercise: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E88E5',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedExerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  removeButton: {
    padding: 4,
  },
  exerciseInstructions: {
    marginTop: 8,
    marginBottom: 0,
  },
  availableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedCard: {
    backgroundColor: '#EBF8FF',
    borderColor: '#1E88E5',
    borderWidth: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  selectedText: {
    color: '#1E88E5',
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FED7D7',
    padding: 16,
    margin: 24,
    borderRadius: 8,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 