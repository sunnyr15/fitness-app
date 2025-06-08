import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image as ImageIcon, Video, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Core', 'Glutes', 'Calves', 'Full Body'
];

const EQUIPMENT = [
  'None', 'Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands',
  'Machine', 'Cable', 'Bodyweight', 'Other'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateExerciseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [thumbnail, setThumbnail] = useState<{ uri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleMediaPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setMedia({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image'
        });
      }
    } catch (error) {
      setError('Error picking media');
    }
  };

  const handleThumbnailPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        setThumbnail({ uri: asset.uri });
      }
    } catch (error) {
      setError('Error picking thumbnail');
    }
  };

  const handleSubmit = async () => {
    if (!name || !media || !equipment || !difficulty || selectedMuscleGroups.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload media to Supabase Storage
      const fileExt = media.uri.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: media.uri,
        name: fileName,
        type: `media/${fileExt}`,
      } as any);

      const { error: uploadError, data } = await supabase.storage
        .from('exercises')
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exercises')
        .getPublicUrl(filePath);

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnail) {
        const thumbExt = thumbnail.uri.split('.').pop();
        const thumbName = `${user?.id}/thumb_${Date.now()}.${thumbExt}`;
        const thumbPath = `${thumbName}`;
        const thumbFormData = new FormData();
        thumbFormData.append('file', {
          uri: thumbnail.uri,
          name: thumbName,
          type: `image/${thumbExt}`,
        } as any);
        const { error: thumbUploadError } = await supabase.storage
          .from('exercises')
          .upload(thumbPath, thumbFormData);
        if (!thumbUploadError) {
          const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
            .from('exercises')
            .getPublicUrl(thumbPath);
          thumbnailUrl = thumbPublicUrl;
        }
      }

      // Create exercise record
      const { error: insertError } = await supabase
        .from('exercises')
        .insert({
          name,
          description,
          media_url: publicUrl,
          media_type: media.type,
          muscle_groups: selectedMuscleGroups,
          equipment,
          difficulty,
          tags,
          created_by: user?.id,
          thumbnail_url: thumbnailUrl,
        });

      if (insertError) throw insertError;

      Alert.alert(
        'Success',
        'Exercise created successfully!',
        [{ text: 'OK', onPress: () => router.replace({ pathname: '/workouts', params: { refresh: Date.now().toString() } }) }]
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error creating exercise');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // If you have any data to refetch, do it here
    setRefreshing(false);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E88E5']}
            tintColor="#1E88E5"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Exercise</Text>
          <View style={{ width: 24 }} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Exercise Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter exercise name"
          />

          <Text style={styles.label}>Media *</Text>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleMediaPick}
          >
            {media ? (
              <View style={styles.mediaPreview}>
                {media.type === 'image' ? (
                  <ImageIcon size={24} color="#1E88E5" />
                ) : (
                  <Video size={24} color="#1E88E5" />
                )}
                <Text style={styles.mediaText}>Media selected</Text>
              </View>
            ) : (
              <Text style={styles.mediaText}>Select photo or video</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Thumbnail (optional)</Text>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleThumbnailPick}
          >
            {thumbnail ? (
              <ImageIcon size={24} color="#1E88E5" />
            ) : (
              <Text style={styles.mediaText}>Select thumbnail image</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Muscle Groups *</Text>
          <View style={styles.muscleGroupsContainer}>
            {MUSCLE_GROUPS.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.muscleGroupPill,
                  selectedMuscleGroups.includes(muscle) && styles.selectedPill,
                ]}
                onPress={() => {
                  setSelectedMuscleGroups(prev =>
                    prev.includes(muscle)
                      ? prev.filter(m => m !== muscle)
                      : [...prev, muscle]
                  );
                }}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedMuscleGroups.includes(muscle) && styles.selectedPillText,
                  ]}
                >
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Equipment *</Text>
          <View style={styles.equipmentContainer}>
            {EQUIPMENT.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.equipmentPill,
                  equipment === item && styles.selectedPill,
                ]}
                onPress={() => setEquipment(item)}
              >
                <Text
                  style={[
                    styles.pillText,
                    equipment === item && styles.selectedPillText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Difficulty *</Text>
          <View style={styles.difficultyContainer}>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyPill,
                  difficulty === level && styles.selectedPill,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.pillText,
                    difficulty === level && styles.selectedPillText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter exercise description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Tags (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tags separated by commas"
            onChangeText={(text) => setTags(text.split(',').map(tag => tag.trim()))}
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
            <Text style={styles.submitButtonText}>Create Exercise</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mediaButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaText: {
    fontSize: 16,
    color: '#718096',
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  muscleGroupPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  equipmentPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  difficultyPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPill: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  pillText: {
    fontSize: 14,
    color: '#4A5568',
  },
  selectedPillText: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    textAlign: 'center',
  },
}); 