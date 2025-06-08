import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostAnnouncementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        setTitle(data.title || '');
        setMessage(data.message || '');
      }
    };
    fetchLatest();
  }, []);

  const handleSave = async () => {
    if (message.length > 150) {
      setError('Message must be 150 characters or less');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('announcements').insert({
        title: title.trim() || null,
        message: message.trim(),
      });
      if (error) throw error;
      Alert.alert('Success', 'Announcement posted!');
      router.replace('/trainer');
    } catch (err: any) {
      setError(err.message || 'Error posting announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={32}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.container, { paddingTop: insets.top + 56 }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 8 }]} hitSlop={12}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChevronLeft size={28} color="#1E88E5" strokeWidth={2} />
              <Text style={{ color: '#1E88E5', fontWeight: '400', fontSize: 17, marginLeft: 2 }}>Back</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Post Announcement</Text>
          <Text style={styles.label}>Title (optional)</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. New Challenge!"
            maxLength={40}
          />
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Write your announcement (emoji supported)"
            maxLength={150}
            multiline
          />
          <Text style={styles.charCount}>{message.length}/150</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.saveButton, { flex: 1 }]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Announcement</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.clearButton, { flex: 1 }]} onPress={handleClear} disabled={loading}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E88E5',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'right',
    marginBottom: 12,
  },
  error: {
    color: '#E53E3E',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButtonText: {
    color: '#2D3748',
    fontWeight: '700',
    fontSize: 16,
  },
}); 