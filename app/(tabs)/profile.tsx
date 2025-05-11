import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ChevronRight, CreditCard, CircleHelp as HelpCircle, LogOut, Camera, Pencil, Check, X, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsLoading(true);
        setError(null);
        
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload image
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);

        const { error: uploadError, data } = await supabase.storage
          .from('profile_photos')
          .upload(filePath, formData);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(filePath);

        // Update user metadata
        await updateProfile({
          avatar_url: publicUrl,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile({
        full_name: newName.trim(),
      });
      setIsEditingName(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={handleImagePick}
            disabled={isLoading}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.defaultAvatarContainer]}>
                <User size={48} color="#94A3B8" strokeWidth={1.5} />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              {isEditingName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter your name"
                    autoFocus
                    selectTextOnFocus
                    onSubmitEditing={handleNameSave}
                  />
                  <View style={styles.nameEditButtons}>
                    <TouchableOpacity 
                      onPress={handleNameSave}
                      style={[styles.nameEditButton, styles.saveButton]}
                      disabled={isLoading}
                    >
                      <Check size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setIsEditingName(false);
                        setNewName(user?.user_metadata?.full_name || '');
                      }}
                      style={[styles.nameEditButton, styles.cancelButton]}
                      disabled={isLoading}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.nameDisplay}
                  onPress={() => setIsEditingName(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.name}>{displayName}</Text>
                  <Pencil size={16} color="#718096" style={styles.editIcon} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.emailContainer}>
              <Mail size={16} color="#718096" />
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#1E88E5" />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Pro</Text>
            <Text style={styles.planPrice}>$10/month</Text>
          </View>
          <Text style={styles.trialText}>7 days left in trial</Text>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
            <ChevronRight size={20} color="#1E88E5" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <CreditCard size={20} color="#4A5568" />
            <Text style={styles.menuItemText}>Payment Methods</Text>
          </View>
          <ChevronRight size={20} color="#CBD5E0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <HelpCircle size={20} color="#4A5568" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color="#CBD5E0" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#F56565" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
    backgroundColor: '#F7FAFC',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatarContainer: {
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 4,
  },
  nameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginRight: 8,
  },
  editIcon: {
    opacity: 0.6,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    padding: Platform.OS === 'web' ? 8 : 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginRight: 8,
  },
  nameEditButtons: {
    flexDirection: 'row',
  },
  nameEditButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#48BB78',
  },
  cancelButton: {
    backgroundColor: '#F56565',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 20,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  planPrice: {
    fontSize: 16,
    color: '#4A5568',
  },
  trialText: {
    fontSize: 14,
    color: '#F6AD55',
    marginBottom: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E88E5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#F56565',
  },
});