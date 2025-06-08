import { useRouter } from 'expo-router';
import { Dumbbell, LayoutGrid, Plus } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrainerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Trainer Dashboard</Text>
          <Text style={styles.subtitle}>Manage your fitness content</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push('/trainer/create-exercise')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Dumbbell color="#1E88E5" size={24} />
            </View>
            <Text style={styles.cardTitle}>Create Exercise</Text>
            <Text style={styles.cardDescription}>Add new exercises to your library</Text>
            <View style={styles.addButton}>
              <Plus color="#1E88E5" size={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/trainer/edit-exercise' as any)}
          >
            <Text style={styles.buttonText}>Edit Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push('/trainer/create-workout')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <LayoutGrid color="#43A047" size={24} />
            </View>
            <Text style={styles.cardTitle}>Create Workout</Text>
            <Text style={styles.cardDescription}>Design new workout routines</Text>
            <View style={styles.addButton}>
              <Plus color="#1E88E5" size={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/trainer/edit-workout' as any)}
          >
            <Text style={styles.buttonText}>Edit Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push('/trainer/announcement')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}> 
              <Text style={{ fontSize: 24 }}>📢</Text>
            </View>
            <Text style={styles.cardTitle}>Post Announcement</Text>
            <Text style={styles.cardDescription}>Share a note with all users</Text>
            <View style={styles.addButton}>
              <Plus color="#1E88E5" size={20} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.quoteButton}
          onPress={() => router.push({ pathname: '/trainer/quote' })}
        >
          <Text style={styles.quoteButtonText}>Change Home Quote</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featuredButton}
          onPress={() => router.push('/trainer/featured-workout')}
        >
          <Text style={styles.featuredButtonText}>Set Featured Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  grid: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  addButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
    marginTop: 8,
  },
  quoteButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  featuredButton: {
    backgroundColor: '#43A047',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
    marginTop: 8,
  },
  featuredButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#1E88E5',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});