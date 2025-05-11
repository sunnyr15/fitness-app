import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Dumbbell, LayoutGrid, Users } from 'lucide-react-native';

export default function TrainerScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Trainer Dashboard</Text>
        <Text style={styles.subtitle}>Manage your fitness content</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Dumbbell color="#1E88E5" size={24} />
          </View>
          <Text style={styles.cardTitle}>Create Exercise</Text>
          <Text style={styles.cardDescription}>Add new exercises to your library</Text>
          <View style={styles.addButton}>
            <Plus color="#1E88E5" size={20} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <LayoutGrid color="#43A047" size={24} />
          </View>
          <Text style={styles.cardTitle}>Create Workout</Text>
          <Text style={styles.cardDescription}>Design new workout routines</Text>
          <View style={styles.addButton}>
            <Plus color="#1E88E5" size={20} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Users color="#F57C00" size={24} />
          </View>
          <Text style={styles.cardTitle}>Create Program</Text>
          <Text style={styles.cardDescription}>Build comprehensive programs</Text>
          <View style={styles.addButton}>
            <Plus color="#1E88E5" size={20} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Programs</Text>
          </View>
        </View>
      </View>
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
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
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
});