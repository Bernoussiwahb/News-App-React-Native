import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { GENRE_OPTIONS } from '../constants/genres';
import { GenreChip } from '../components/GenreChip';
import { useAuth } from '../context/AuthContext';

const APP_NAME = 'PulseWave';

const MIN_PASSWORD_LENGTH = 6;

export const SignupScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    preferredGenres: [],
  });
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.firstName.trim() !== '' &&
      form.lastName.trim() !== '' &&
      form.email.trim() !== '' &&
      form.password.trim().length >= MIN_PASSWORD_LENGTH &&
      form.preferredGenres.length > 0
    );
  }, [form]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGenre = (genre) => {
    setForm((prev) => {
      const selected = prev.preferredGenres.includes(genre)
        ? prev.preferredGenres.filter((item) => item !== genre)
        : [...prev.preferredGenres, genre];
      return { ...prev, preferredGenres: selected };
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert(
        'Missing information',
        'Please complete all fields, choose at least one genre, and ensure your password is 6+ characters.'
      );
      return;
    }

    try {
      setLoading(true);
      await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        preferredGenres: form.preferredGenres,
      });
      Alert.alert('Welcome to PulseWave', 'Your account was created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      Alert.alert('Account creation failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={true}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>Sign up to stay ahead of the headlines.</Text>

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane"
                placeholderTextColor={colors.textSecondary}
                value={form.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.flexItem, styles.leftSpacing]}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor={colors.textSecondary}
                value={form.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(value) => handleChange('email', value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={form.password}
              onChangeText={(value) => handleChange('password', value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred genres</Text>
            <Text style={styles.helper}>Choose what you love. You can update this later.</Text>
            <View style={styles.genreContainer}>
              {GENRE_OPTIONS.map((genre) => (
                <GenreChip
                  key={genre}
                  label={genre}
                  selected={form.preferredGenres.includes(genre)}
                  onPress={() => toggleGenre(genre)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
          >
            <Text style={styles.buttonLabel}>{loading ? 'Creating account...' : 'Create account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  flexItem: {
    flex: 1,
  },
  leftSpacing: {
    marginLeft: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  helper: {
    color: colors.textSecondary,
    marginBottom: 12,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: colors.accent,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
