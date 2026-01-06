import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const ArticleCard = ({ article, onPress, onToggleFavorite, isFavorite }) => {
  const hasImage = !!article?.urlToImage;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        {hasImage ? (
          <Image source={{ uri: article.urlToImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
        <Pressable onPress={onToggleFavorite} style={styles.heartButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? colors.danger : colors.textPrimary}
          />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {article.title}
        </Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {article.description || 'Tap to read details.'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    height: 140,
    width: '100%',
  },
  imagePlaceholder: {
    height: 140,
    width: '100%',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  heartButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 16, 32, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
