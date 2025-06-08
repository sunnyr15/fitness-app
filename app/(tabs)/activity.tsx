import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActivityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLogs().finally(() => setLoading(false));
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchLogs();
    }, [user])
  );

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*, workout:workout_id(name)')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      setError('Error loading activity');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Activity</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No completed workouts yet.</Text>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#1E88E5']}
                tintColor="#1E88E5"
              />
            }
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <Text style={styles.workoutName}>{item.workout?.name || 'Workout'}</Text>
                <Text style={styles.date}>{new Date(item.completed_at).toLocaleString()}</Text>
                {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => router.push({ pathname: '/workout/[id]', params: { id: item.workout_id, log_id: item.id } })}
                >
                  <Text style={styles.detailsBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  emptyText: {
    color: '#718096',
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  detailsBtn: {
    backgroundColor: '#1E88E5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  detailsBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 