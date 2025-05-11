import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react-native';

export default function ProgramsScreen() {
  const programs = [
    {
      id: 1,
      name: "4-Week Strength Training",
      description: "Build strength and muscle with this comprehensive program",
      duration: "4 weeks",
      level: "Intermediate",
      image: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
    },
    {
      id: 2,
      name: "HIIT Cardio Challenge",
      description: "High-intensity interval training for maximum fat burn",
      duration: "3 weeks",
      level: "Advanced",
      image: "https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg",
    },
    {
      id: 3,
      name: "Beginner's Fitness Journey",
      description: "Perfect for those just starting their fitness journey",
      duration: "6 weeks",
      level: "Beginner",
      image: "https://images.pexels.com/photos/4498604/pexels-photo-4498604.jpeg",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
        <Text style={styles.subtitle}>Transform your body with our structured programs</Text>
      </View>

      <View style={styles.programsContainer}>
        {programs.map((program) => (
          <TouchableOpacity key={program.id} style={styles.programCard}>
            <Image source={{ uri: program.image }} style={styles.programImage} />
            <View style={styles.programContent}>
              <View style={styles.programHeader}>
                <Text style={styles.programName}>{program.name}</Text>
                <ChevronRight color="#718096" size={20} />
              </View>
              
              <Text style={styles.programDescription}>{program.description}</Text>
              
              <View style={styles.programMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color="#718096" />
                  <Text style={styles.metaText}>{program.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <CalendarIcon size={16} color="#718096" />
                  <Text style={styles.metaText}>{program.level}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  programsContainer: {
    paddingHorizontal: 24,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  programImage: {
    width: '100%',
    height: 200,
  },
  programContent: {
    padding: 20,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  programDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#718096',
  },
});