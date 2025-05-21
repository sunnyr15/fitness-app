import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function WorkoutsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>Choose your workout type</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Full Workouts</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Full workouts coming soon...</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Exercises</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Individual exercises coming soon...</Text>
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  placeholderCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#718096',
  },
});