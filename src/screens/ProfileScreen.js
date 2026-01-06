import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { GENRE_OPTIONS } from '../constants/genres';
import { GenreChip } from '../components/GenreChip';

export const ProfileScreen = () => {
  const { user, updateProfile, logout, initializing } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    preferredGenres: user?.preferredGenres ?? [],
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || isEditing) return;
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      preferredGenres: Array.isArray(user.preferredGenres) ? user.preferredGenres : [],
    });
  }, [user, isEditing]);

  const canSave = useMemo(() => {
    if (!user) return false;
    return (
      form.firstName.trim() !== '' &&
      form.lastName.trim() !== '' &&
      form.preferredGenres.length > 0 &&
      (form.firstName !== user.firstName ||
        form.lastName !== user.lastName ||
        form.preferredGenres.join(',') !== user.preferredGenres.join(','))
    );
  }, [form, user]);

  const toggleGenre = (genre) => {
    setForm((prev) => {
      const selected = prev.preferredGenres.includes(genre)
        ? prev.preferredGenres.filter((item) => item !== genre)
        : [...prev.preferredGenres, genre];
      return { ...prev, preferredGenres: selected };
    });
  };

  const handleSave = async () => {
    if (!user) return;

    if (!canSave) {
      Alert.alert('Nothing to update', 'Please adjust your info or genres before saving.');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        preferredGenres: form.preferredGenres,
      });
      setIsEditing(false);
      Alert.alert('Profile updated', 'Your preferences have been saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update your profile.';
      Alert.alert('Update failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      preferredGenres: user?.preferredGenres ?? [],
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      setIsEditing(false);
      await logout();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log out. Please try again.';
      Alert.alert('Logout failed', message);
    }
  };

  if (initializing) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing((prev) => !prev)}>
          <Text style={styles.editButtonLabel}>{isEditing ? 'Close' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.firstName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
              editable={isEditing}
              placeholder="First name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.lastName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
              editable={isEditing}
              placeholder="Last name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user.email}
              editable={false}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred genres</Text>
        <View style={styles.card}>
          <Text style={styles.helper}>Tune your feed by picking the topics that matter most.</Text>
          <View style={styles.genreContainer}>
            {GENRE_OPTIONS.map((genre) => (
              <GenreChip
                key={genre}
                label={genre}
                selected={form.preferredGenres.includes(genre)}
                onPress={isEditing ? () => toggleGenre(genre) : undefined}
              />
            ))}
          </View>
        </View>
      </View>

      {isEditing && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton, (!canSave || loading) && styles.disabledButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveLabel}>{loading ? 'Saving...' : 'Save changes'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutLabel}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  helper: {
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
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
  disabledInput: {
    opacity: 0.7,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
