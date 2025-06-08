import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Play, TrendingUp } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [quote, setQuote] = useState('');
  const [featuredWorkout, setFeaturedWorkout] = useState<any>(null);

  const fetchCompletedWorkouts = async () => {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    // Get the end of the current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', user?.id)
      .gte('completed_at', startOfWeek.toISOString())
      .lte('completed_at', endOfWeek.toISOString());

    if (!error) {
      setCompletedWorkouts(data?.length || 0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompletedWorkouts();
    }, [user?.id])
  );

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) setAnnouncement(data);
    };
    fetchAnnouncement();

    const fetchQuote = async () => {
      const { data, error } = await supabase
        .from('home_quote')
        .select('quote')
        .limit(1)
        .single();
      if (!error && data) setQuote(data.quote || '');
    };
    fetchQuote();

    const fetchFeaturedWorkout = async () => {
      const { data, error } = await supabase
        .from('featured_workout')
        .select('workout:workout_id(*)')
        .eq('id', 1)
        .single();
      if (!error && data && data.workout) setFeaturedWorkout(data.workout);
    };
    fetchFeaturedWorkout();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋</Text>
        <Text style={styles.subtitle}>Ready for today's challenge?</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/workouts')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Play color="#1E88E5" size={24} />
          </View>
          <Text style={styles.actionTitle}>Start Workout</Text>
          <Text style={styles.actionSubtext}>Choose from catalog</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/activity')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <TrendingUp color="#F57C00" size={24} />
          </View>
          <Text style={styles.actionTitle}>Track Progress</Text>
          <Text style={styles.actionSubtext}>View your journey</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>This Week</Text>
        <View style={[styles.statsContent, { justifyContent: 'center' }]}> 
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Workouts</Text>
            <Text style={styles.statNumber}>{completedWorkouts}</Text>
            <Text style={styles.statLabel}>Completed This Week</Text>
          </View>
        </View>
      </View>

      <View style={styles.coachNoteCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.coachNoteIcon}>📢</Text>
          <Text style={styles.coachNoteTitle}>Coach's Note</Text>
        </View>
        {announcement?.title ? (
          <Text style={styles.coachNoteAnnouncementTitle}>{announcement.title}</Text>
        ) : null}
        {announcement?.message?.trim() ? (
          <Text style={styles.coachNoteMessage} numberOfLines={3}>
            {announcement.message}
          </Text>
        ) : null}
      </View>

      {quote?.trim() ? (
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      ) : null}

      {featuredWorkout ? (
        <TouchableOpacity
          style={styles.featuredWorkoutCard}
          onPress={() => router.push(`/workout/${featuredWorkout.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.featuredWorkoutTitle}>Featured Workout</Text>
          <Text style={styles.featuredWorkoutName}>{featuredWorkout.name}</Text>
          {featuredWorkout.description ? (
            <Text style={styles.featuredWorkoutDesc}>{featuredWorkout.description}</Text>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  quickActions: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#718096',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
  },
  coachNoteCard: {
    marginHorizontal: 24,
    marginBottom: 28,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#1E88E5',
  },
  coachNoteIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  coachNoteTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E88E5',
  },
  coachNoteAnnouncementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 6,
  },
  coachNoteMessage: {
    fontSize: 17,
    color: '#2D3748',
    fontWeight: '600',
    lineHeight: 24,
  },
  quoteContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
  },
  quoteText: {
    fontSize: 16,
    color: '#4A5568',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  featuredWorkoutCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: '#FFFDE7',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#FBC02D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#FBC02D',
  },
  featuredWorkoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FBC02D',
    marginBottom: 8,
  },
  featuredWorkoutName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 6,
  },
  featuredWorkoutDesc: {
    fontSize: 15,
    color: '#4A5568',
  },
});