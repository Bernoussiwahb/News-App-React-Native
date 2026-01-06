import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

export const ArticleDetailsScreen = ({ route }) => {
  const { article } = route.params || {};
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites(user);

  if (!article) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No article found.</Text>
      </View>
    );
  }

  const handleOpen = () => {
    if (article.url) {
      Linking.openURL(article.url).catch(() => {});
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {article.urlToImage ? (
        <Image source={{ uri: article.urlToImage }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroFallback}>
          <Text style={styles.heroFallbackText}>No image</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.title}>{article.title}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(article)} style={styles.heartButton}>
          <Ionicons
            name={isFavorite(article) ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite(article) ? colors.danger : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.meta}>
        {article.source?.name ? `${article.source.name} • ` : ''}
        {article.author ? `${article.author} • ` : ''}
        {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : ''}
      </Text>

      {article.description ? <Text style={styles.description}>{article.description}</Text> : null}
      {article.content ? <Text style={styles.contentText}>{article.content}</Text> : null}

      <TouchableOpacity style={styles.openButton} onPress={handleOpen}>
        <Text style={styles.openButtonLabel}>Open original article</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
  },
  heroFallback: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroFallbackText: {
    color: colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 12,
  },
  description: {
    marginTop: 16,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  contentText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  openButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  openButtonLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
