import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FeaturedWorkoutScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError('Error loading workouts');
      else setWorkouts(data || []);
      setLoading(false);
    };
    fetchWorkouts();
  }, []);

  const handleSelect = async (workoutId: string) => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('featured_workout')
        .upsert({ id: 1, workout_id: workoutId }, { onConflict: 'id' });
      if (error) throw error;
      Alert.alert('Success', 'Featured workout updated!');
      router.replace('/trainer');
    } catch (err: any) {
      setError(err.message || 'Error setting featured workout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24, marginLeft: -8 }} hitSlop={12}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ChevronLeft size={28} color="#43A047" strokeWidth={2} />
          <Text style={{ color: '#43A047', fontWeight: '400', fontSize: 17, marginLeft: 2 }}>Back</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>Select Featured Workout</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => handleSelect(item.id)}
            disabled={saving}
          >
            <Text style={styles.workoutName}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.workoutDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#43A047',
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: '#E53E3E',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  workoutDesc: {
    fontSize: 14,
    color: '#4A5568',
  },
}); 