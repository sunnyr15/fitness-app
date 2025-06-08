import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ChevronLeft, Settings, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.user_metadata?.full_name || '');
  const [editHometown, setEditHometown] = useState(user?.user_metadata?.hometown || '');
  const [editBio, setEditBio] = useState(user?.user_metadata?.bio || '');
  const [editAvatar, setEditAvatar] = useState(user?.user_metadata?.avatar_url || '');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editMobile, setEditMobile] = useState(user?.user_metadata?.mobile || '');
  const [editUnits, setEditUnits] = useState(user?.user_metadata?.units || 'lbs');
  const [editNotifications, setEditNotifications] = useState(user?.user_metadata?.notifications ?? true);
  const [localUser, setLocalUser] = useState(user);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      setLocalUser(data.user as typeof user);
    }
  };

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  // Subscribe to auth state changes for real-time updates
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setLocalUser(session.user as typeof user);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
        setIsUpdatingAvatar(true);
        setError(null);
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);
        const { error: uploadError } = await supabase.storage
          .from('profile_photos')
          .upload(filePath, formData);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(filePath);
        await updateProfile({ avatar_url: publicUrl });
        await fetchProfile();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating profile picture');
    } finally {
      setIsLoading(false);
      setIsUpdatingAvatar(false);
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProfile(); // or your user data fetch function
    setRefreshing(false);
  }, []);

  const handleEditProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateProfile({
        full_name: editName.trim(),
        hometown: editHometown.trim(),
        bio: editBio.trim(),
        avatar_url: editAvatar,
      });
      setEditModalVisible(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setIsLoading(true);
        setIsUpdatingAvatar(true);
        setError(null);
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);
        const { error: uploadError } = await supabase.storage
          .from('profile_photos')
          .upload(filePath, formData);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(filePath);
        setEditAvatar(publicUrl);
        await updateProfile({ avatar_url: publicUrl });
        await fetchProfile();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating profile picture');
    } finally {
      setIsLoading(false);
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['#1E88E5']}
        tintColor="#1E88E5"
      />
    }>
      <View style={styles.profileRoot}>
        <View style={styles.profileTop}>
          <TouchableOpacity style={styles.profilePicContainer} onPress={handleEditImagePick}>
            {isUpdatingAvatar ? (
              <ActivityIndicator size="large" color="#1E88E5" />
            ) : editAvatar || localUser?.user_metadata?.avatar_url ? (
              <Image source={{ uri: editAvatar || localUser?.user_metadata?.avatar_url }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <User size={48} color="#94A3B8" strokeWidth={1.5} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.profileBtnRow}>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => {
              setEditName(user?.user_metadata?.full_name || '');
              setEditHometown(user?.user_metadata?.hometown || '');
              setEditBio(user?.user_metadata?.bio || '');
              setEditAvatar(user?.user_metadata?.avatar_url || '');
              setEditModalVisible(true);
            }}>
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsModalVisible(true)}>
              <Settings color="#1E88E5" size={22} />
                </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileSpacer} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalRoot}>
          <View style={styles.editModalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.editModalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleEditProfile} disabled={isLoading}>
              <Text style={[styles.editModalSave, isLoading && { opacity: 0.5 }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.editProfilePicContainer} onPress={handleEditImagePick}>
            {editAvatar ? (
              <Image source={{ uri: editAvatar }} style={styles.editProfilePic} />
            ) : (
              <View style={styles.editProfilePicPlaceholder}>
                <User size={48} color="#94A3B8" strokeWidth={1.5} />
              </View>
            )}
            <Text style={styles.editProfilePicText}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.editFields}>
            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
            />
            <Text style={styles.editLabel}>Hometown</Text>
            <TextInput
              style={styles.editInput}
              value={editHometown}
              onChangeText={setEditHometown}
              placeholder="City, State"
            />
            <Text style={styles.editLabel}>Bio</Text>
            <TextInput
              style={[styles.editInput, styles.editBioInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="150 characters"
              maxLength={150}
              multiline
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {isLoading && <ActivityIndicator color="#1E88E5" style={{ marginTop: 16 }} />}
        </View>
      </Modal>
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.settingsModalRoot}>
          <View style={styles.settingsHeader}>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)} hitSlop={12}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ChevronLeft size={28} color="#1E88E5" strokeWidth={2} />
                <Text style={{ color: '#1E88E5', fontWeight: '400', fontSize: 17, marginLeft: 2 }}>Back</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.settingsTitle}>Settings</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsLabel}>Email</Text>
              <View style={styles.settingsRowDisabled}>
                <Text style={styles.settingsValue}>{user?.email}</Text>
              </View>
              <Text style={styles.settingsLabel}>Mobile Number</Text>
              <TouchableOpacity style={styles.settingsRow} activeOpacity={1}>
                <TextInput
                  style={styles.settingsInput}
                  value={editMobile}
                  onChangeText={setEditMobile}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={20}
                />
        </TouchableOpacity>
              <Text style={styles.settingsLabel}>Notification Preferences</Text>
              <TouchableOpacity style={styles.settingsRow} activeOpacity={1}>
                <Text style={styles.settingsValue}>Notifications</Text>
                <TouchableOpacity
                  style={styles.settingsSwitch}
                  onPress={() => setEditNotifications(!editNotifications)}
                >
                  <View style={[styles.switchTrack, editNotifications && styles.switchTrackActive]}>
                    <View style={[styles.switchThumb, editNotifications && styles.switchThumbActive]} />
      </View>
                </TouchableOpacity>
              </TouchableOpacity>
              <Text style={styles.settingsLabel}>Units of Measure</Text>
              <View style={styles.settingsRow}>
                <TouchableOpacity
                  style={[styles.unitsBtn, editUnits === 'lbs' && styles.unitsBtnActive]}
                  onPress={() => setEditUnits('lbs')}
                >
                  <Text style={[styles.unitsBtnText, editUnits === 'lbs' && styles.unitsBtnTextActive]}>lbs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitsBtn, editUnits === 'kg' && styles.unitsBtnActive]}
                  onPress={() => setEditUnits('kg')}
                >
                  <Text style={[styles.unitsBtnText, editUnits === 'kg' && styles.unitsBtnTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitsBtn, editUnits === 'miles' && styles.unitsBtnActive]}
                  onPress={() => setEditUnits('miles')}
                >
                  <Text style={[styles.unitsBtnText, editUnits === 'miles' && styles.unitsBtnTextActive]}>miles</Text>
                </TouchableOpacity>
      <TouchableOpacity 
                  style={[styles.unitsBtn, editUnits === 'km' && styles.unitsBtnActive]}
                  onPress={() => setEditUnits('km')}
                >
                  <Text style={[styles.unitsBtnText, editUnits === 'km' && styles.unitsBtnTextActive]}>km</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.settingsSection}>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {/* open privacy policy */}}>
                <Text style={styles.settingsValue}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {/* open terms of use */}}>
                <Text style={styles.settingsValue}>Terms of Use</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {/* open delete account */}}>
                <Text style={[styles.settingsValue, { color: '#E53E3E' }]}>Delete Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
                <Text style={[styles.settingsValue, { color: '#F56565' }]}>Log Out</Text>
      </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  profileTop: {
    alignItems: 'center',
    marginTop: 60,
  },
  profilePicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },
  profileBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  editProfileBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E88E5',
    borderWidth: 2,
    borderRadius: 24,
    height: 44,
    minWidth: 140,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editProfileBtnText: {
    color: '#1E88E5',
    fontWeight: '600',
    fontSize: 16,
  },
  profileSpacer: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: 24,
  },
  logoutText: {
    color: '#F56565',
    fontWeight: '600',
    fontSize: 16,
  },
  editModalRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  editModalCancel: {
    color: '#718096',
    fontSize: 18,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  editModalSave: {
    color: '#1E88E5',
    fontWeight: '700',
    fontSize: 18,
  },
  editProfilePicContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editProfilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  editProfilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editProfilePicText: {
    color: '#718096',
    fontSize: 14,
    marginBottom: 16,
  },
  editFields: {
    marginBottom: 24,
  },
  editLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
  },
  editBioInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  settingsBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E88E5',
    borderWidth: 2,
    borderRadius: 24,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsModalRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 0,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  settingsLabel: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 4,
  },
  settingsRowDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 4,
  },
  settingsValue: {
    fontSize: 16,
    color: '#2D3748',
  },
  settingsInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  settingsSwitch: {
    marginLeft: 12,
  },
  switchTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: '#1E88E5',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    marginLeft: 0,
  },
  switchThumbActive: {
    marginLeft: 16,
  },
  unitsBtn: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitsBtnActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  unitsBtnText: {
    color: '#2D3748',
    fontWeight: '600',
    fontSize: 15,
  },
  unitsBtnTextActive: {
    color: '#FFFFFF',
  },
});